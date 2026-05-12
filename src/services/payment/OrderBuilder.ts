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

  // ── Correction #1 & #2 : Transaction atomique + gestion d'erreurs ──
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Créer la commande
    const [order] = await Order.create([{
      user: cart.user,
      total,
      address: address._id,
    }], { session });

    // 2. Créer les OrderItems via Order.buildOrderItems() ← Correction #3
    const orderItemsData = order.buildOrderItems(
      cart.items!.map((item) => ({
        product: (item.product as unknown as ProductDocument)._id ?? item.product,
        quantity: item.quantity,
      }))
    );
    await OrderItem.insertMany(orderItemsData, { session });

    // 3. Traitement paiement (Stripe / PayPal)
    const result = await processor.process(total, String(order._id));

    const paymentStatusMap: Record<string, PaymentStatusEnum> = {
      COMPLETED: PaymentStatusEnum.Completed,
      PENDING:   PaymentStatusEnum.Pending,
      FAILED:    PaymentStatusEnum.Failed,
    };

    // 4. Créer le paiement
    const [paymentRecord] = await Payment.create([{
      order:         order._id,
      amount:        total,
      method:        processor.methodName,
      status:        paymentStatusMap[result.status] ?? PaymentStatusEnum.Pending,
      transactionId: result.transactionId,
    }], { session });

    // 5. Créer la livraison
    const [livraison] = await Livraison.create([{
      order:          order._id,
      address:        address._id,
      status:         StatusEnum.Shipped,
      trackingNumber: `TRK-${new mongoose.Types.ObjectId().toString()}`,
    }], { session });

    // 6. Lier payment + livraison à la commande
    await Order.findByIdAndUpdate(
      order._id,
      { payment: paymentRecord._id, livraison: livraison._id },
      { session }
    ).exec();

    // ✅ Tout a réussi → on valide la transaction
    await session.commitTransaction();

    // Nettoyage du panier (hors transaction — pas critique)
    await CartItem.deleteMany({ cart: cart._id }).exec();

    // Retourner la commande complète
    const completedOrder = await Order.findById(order._id)
      .populate({ path: 'items', populate: { path: 'product' } })
      .populate('payment')
      .populate('address')
      .populate('livraison')
      .exec();

    if (!completedOrder) {
      throw new Error('Order not found after completion');
    }

    return { order: completedOrder, payment: paymentRecord, livraison };

  } catch (err: unknown) {
    // ❌ Une erreur → rollback automatique de TOUTES les écritures
    await session.abortTransaction();

    if (err instanceof Error && err.message.includes('E11000')) {
      throw new BuilderStateError('duplicate-order');
    }
    throw new Error(`OrderBuilder.build() failed: ${String(err)}`);

  } finally {
    // Toujours fermer la session
    session.endSession();
  }
}
}
