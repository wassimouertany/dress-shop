import mongoose from 'mongoose';
import {
  Cart,
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
} from '../models';
import { Address } from '../models/Address';
import { paymentRegistry } from './payment/PaymentProcessorRegistry';

const cartItemsPopulate = {
  path: 'items',
  populate: { path: 'product' },
} as const;

export const processPayment = async (
  userId: string,
  method: string,
  addressId: string,
  providerPayload: Record<string, unknown> = {}
): Promise<{
  order: OrderDocument;
  payment: PaymentDocument;
  livraison: LivraisonDocument;
}> => {

  // ── 1. Validate payment method ────────────────────────────────────────────
  if (!method) {
    throw new Error('Payment method is required');
  }

  const processor = paymentRegistry.get(method);
  processor.validate(providerPayload);

  // ── 2. Validate address ───────────────────────────────────────────────────
  if (!addressId) {
    throw new Error('addressId is required');
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  }).exec();

  if (!address) {
    throw new Error('Address not found');
  }

  // ── 3. Validate cart ──────────────────────────────────────────────────────
  const cart = await Cart.findOne({ user: userId })
    .populate(cartItemsPopulate)
    .exec();

  if (!cart?.items?.length) {
    throw new Error('Cart is empty');
  }

  // ── 4. Calculate total ────────────────────────────────────────────────────
  const total = cart.calculateTotal();

  // ── 5. Create order ───────────────────────────────────────────────────────
  const order = await Order.create({
    user: userId,
    total,
    address: address._id,
  });

  // ── 6. GRASP Creator — let Order build its own OrderItems ─────────────────
  
  const cartItemsData = cart.items.map((item) => ({
    product:  (item.product as unknown as ProductDocument)._id ?? item.product,
    quantity: item.quantity,
  }));

  await OrderItem.insertMany(order.buildOrderItems(cartItemsData));

  // ── 7. Process payment via registry ──────────────────────────────────────
  const result = await processor.process(total, String(order._id));

  const paymentStatusMap: Record<string, PaymentStatusEnum> = {
    COMPLETED: PaymentStatusEnum.Completed,
    PENDING:   PaymentStatusEnum.Pending,
    FAILED:    PaymentStatusEnum.Failed,
  };

  const paymentRecord = await Payment.create({
    order:         order._id,
    amount:        total,
    method:        processor.methodName,
    status:        paymentStatusMap[result.status] ?? PaymentStatusEnum.Pending,
    transactionId: result.transactionId,
  });

  // ── 8. Create livraison ───────────────────────────────────────────────────
  const livraison = await Livraison.create({
    order:          order._id,
    address:        address._id,
    status:         StatusEnum.Shipped,
    trackingNumber: `TRK-${new mongoose.Types.ObjectId().toString()}`,
  });

  await Order.findByIdAndUpdate(order._id, {
    payment:   paymentRecord._id,
    livraison: livraison._id,
  }).exec();

  // ── 9. Clear cart ─────────────────────────────────────────────────────────
  await CartItem.deleteMany({ cart: cart._id }).exec();

  // ── 10. Return completed order ────────────────────────────────────────────
  const completedOrder = await Order.findById(order._id)
    .populate({
      path: 'items',
      populate: { path: 'product' },
    })
    .populate('payment')
    .populate('address')
    .populate('livraison')
    .exec();

  if (!completedOrder) {
    throw new Error('Order not found after completion');
  }

  return {
    order:    completedOrder,
    payment:  paymentRecord,
    livraison,
  };
};