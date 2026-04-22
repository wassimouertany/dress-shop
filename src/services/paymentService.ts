import mongoose from 'mongoose';
import {
  Cart,
  CartItem,
  Livraison,
  Order,
  OrderItem,
  Payment,
  PaymentMethodEnum,
  PaymentStatusEnum,
  StatusEnum,
  OrderDocument,
  PaymentDocument,
  LivraisonDocument,
  ProductDocument,
} from '../models';
import { Address } from '../models/Address';

const METHOD_VALUES: PaymentMethodEnum[] = [
  PaymentMethodEnum.Paypal,
  PaymentMethodEnum.Stripe,
];

const cartItemsPopulate = {
  path: 'items',
  populate: { path: 'product' },
} as const;

const asPopulatedProduct = (ref: unknown): ProductDocument =>
  ref as ProductDocument;

export const processPayment = async (
  userId: string,
  method: string,
  addressId: string
): Promise<{
  order: OrderDocument;
  payment: PaymentDocument;
  livraison: LivraisonDocument;
}> => {
  if (!method || !METHOD_VALUES.includes(method as PaymentMethodEnum)) {
    throw new Error('Invalid or missing method; use PAYPAL or STRIPE');
  }

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

  const cart = await Cart.findOne({ user: userId })
    .populate(cartItemsPopulate)
    .exec();

  if (!cart?.items?.length) {
    throw new Error('Cart is empty');
  }

  const total = cart.items.reduce(
    (acc, el) =>
      acc + asPopulatedProduct(el.product).price * el.quantity,
    0
  );

  const order = await Order.create({
    user: userId,
    total,
    address: address._id,
  });

  await OrderItem.insertMany(
    cart.items.map((item) => ({
      order: order._id,
      quantity: item.quantity,
      product:
        asPopulatedProduct(item.product)._id ?? item.product,
    }))
  );

  let paymentRecord = await Payment.create({
    order: order._id,
    amount: total,
    method,
    status: PaymentStatusEnum.Pending,
    transactionId: new mongoose.Types.ObjectId().toString(),
  });

  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentRecord._id,
    { status: PaymentStatusEnum.Completed },
    { new: true }
  ).exec();

  if (!updatedPayment) {
    throw new Error('Payment update failed');
  }

  paymentRecord = updatedPayment;

  const livraison = await Livraison.create({
    order: order._id,
    address: address._id,
    status: StatusEnum.Shipped,
    trackingNumber: `TRK-${new mongoose.Types.ObjectId().toString()}`,
  });

  await Order.findByIdAndUpdate(order._id, {
    payment: paymentRecord._id,
    livraison: livraison._id,
  }).exec();

  await CartItem.deleteMany({ cart: cart._id }).exec();

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
    order: completedOrder,
    payment: paymentRecord,
    livraison,
  };
};
