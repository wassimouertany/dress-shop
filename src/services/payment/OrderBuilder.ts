import mongoose from 'mongoose';
import {
  CartItem,
  Livraison,
  Order,
  OrderItem,
  Payment,
  PaymentStatusEnum,
  StatusEnum,
  OrderDocument,
  PaymentDocument,
  LivraisonDocument,
  ProductDocument,
  CartDocument,
} from '../../models';
import { Address } from '../../models/Address';
import type { IPaymentProcessor } from './IPaymentProcessor';

type AddressNonNull = NonNullable<
  Awaited<ReturnType<ReturnType<typeof Address.findOne>['exec']>>
>;

export interface OrderResult {
  order: OrderDocument;
  payment: PaymentDocument;
  livraison: LivraisonDocument;
}

export class BuilderStateError extends Error {
  readonly statusCode = 400;
  constructor(field: string) {
    super(`OrderBuilder: '${field}' must be set before calling build()`);
    this.name = 'BuilderStateError';
  }
}

/**
 * Coordinates checkout persistence. All Mongo writes for one checkout share one
 * session so Order, OrderItems, Payment, Livraison (and cart cleanup) commit or
 * roll back together. External `processor.process()` is not transactional with
 * MongoDB; production systems typically add idempotency keys, outbox, or a
 * compensating refund if the DB transaction aborts after a successful charge.
 */
export class OrderBuilder {
  private processor?: IPaymentProcessor;
  private address?: AddressNonNull;
  private cart?: CartDocument;
  private total?: number;
  private providerPayload: Record<string, unknown> = {};

  setProviderPayload(payload: Record<string, unknown>): this {
    this.providerPayload = payload;
    return this;
  }

  setProcessor(processor: IPaymentProcessor): this {
    processor.validate(this.providerPayload);
    this.processor = processor;
    return this;
  }

  setAddress(address: AddressNonNull): this {
    this.address = address;
    return this;
  }

  setCart(cart: CartDocument): this {
    if (!cart.items?.length) {
      throw new Error('Cart is empty');
    }
    this.cart = cart;
    this.total = cart.calculateTotal();
    return this;
  }

  async build(): Promise<OrderResult> {
    if (this.processor === undefined) {
      throw new BuilderStateError('processor');
    }
    if (this.address === undefined) {
      throw new BuilderStateError('address');
    }
    if (this.cart === undefined) {
      throw new BuilderStateError('cart');
    }
    if (this.total === undefined) {
      throw new BuilderStateError('total');
    }

    const processor = this.processor;
    const address = this.address;
    const cart = this.cart;
    const total = this.total;

    const session = await mongoose.startSession();

    type TxOutcome = {
      orderId: mongoose.Types.ObjectId;
      payment: PaymentDocument;
      livraison: LivraisonDocument;
    };
    let txOutcome!: TxOutcome;

    try {
      await session.withTransaction(async () => {
        const [createdOrder] = await Order.create(
          [
            {
              user: cart.user,
              total,
              address: address._id,
            },
          ],
          { session }
        );

        const orderItemsData = createdOrder.buildOrderItems(
          cart.items!.map((item) => ({
            product:
              (item.product as unknown as ProductDocument)._id ?? item.product,
            quantity: item.quantity,
          }))
        );
        await OrderItem.insertMany(orderItemsData, { session });

        const result = await processor.process(total, String(createdOrder._id));

        const paymentStatusMap: Record<string, PaymentStatusEnum> = {
          COMPLETED: PaymentStatusEnum.Completed,
          PENDING: PaymentStatusEnum.Pending,
          FAILED: PaymentStatusEnum.Failed,
        };

        const [createdPayment] = await Payment.create(
          [
            {
              order: createdOrder._id,
              amount: total,
              method: processor.methodName,
              status:
                paymentStatusMap[result.status] ?? PaymentStatusEnum.Pending,
              transactionId: result.transactionId,
            },
          ],
          { session }
        );

        const [createdLivraison] = await Livraison.create(
          [
            {
              order: createdOrder._id,
              address: address._id,
              status: StatusEnum.Shipped,
              trackingNumber: `TRK-${new mongoose.Types.ObjectId().toString()}`,
            },
          ],
          { session }
        );

        await Order.findByIdAndUpdate(
          createdOrder._id,
          { payment: createdPayment._id, livraison: createdLivraison._id },
          { session }
        ).exec();

        await CartItem.deleteMany({ cart: cart._id }, { session }).exec();

        txOutcome = {
          orderId: createdOrder._id,
          payment: createdPayment,
          livraison: createdLivraison,
        };
      });

      const completedOrder = await Order.findById(txOutcome.orderId)
        .populate({ path: 'items', populate: { path: 'product' } })
        .populate('payment')
        .populate('address')
        .populate('livraison')
        .exec();

      if (!completedOrder) {
        throw new Error('Order not found after completion');
      }

      return {
        order: completedOrder,
        payment: txOutcome.payment,
        livraison: txOutcome.livraison,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('E11000')) {
        throw new BuilderStateError('duplicate-order');
      }
      throw new Error(`OrderBuilder.build() failed: ${String(err)}`);
    } finally {
      session.endSession();
    }
  }
}
