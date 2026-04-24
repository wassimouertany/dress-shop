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

// ─── processPayment ───────────────────────────────────────────────────────────

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

  // ── 1. Validation de la méthode via le registry (OCP) ──────────────────────
  if (!method) {
    throw new Error('Payment method is required');
  }

  const processor = paymentRegistry.get(method);
  processor.validate(providerPayload);

  // ── 2. Validation de l'adresse ────────────────────────────────────────────
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

  // ── 3. Validation du panier ───────────────────────────────────────────────
  // FIX: removed `as const` on the populate config — it caused Mongoose to
  // silently skip virtual population, making cart.items always undefined.
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items',
      populate: { path: 'product' },
    })
    .exec();

  if (!cart?.items?.length) {
    throw new Error('Cart is empty');
  }

  // ── 4. Calcul du total ─────────────────────────────────────────────────────
  const total = cart.calculateTotal();

  // ── 5. Création de la commande ────────────────────────────────────────────
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
        (item.product as unknown as ProductDocument)._id ?? item.product,
    }))
  );

  // ── 6. Traitement du paiement via le processor sélectionné (OCP) ──────────
  const result = await processor.process(total, String(order._id));

  const paymentStatusMap: Record<string, PaymentStatusEnum> = {
    COMPLETED:  PaymentStatusEnum.Completed,
    PENDING:    PaymentStatusEnum.Pending,
    FAILED:     PaymentStatusEnum.Failed,
  };

  const paymentRecord = await Payment.create({
    order:         order._id,
    amount:        total,
    method:        processor.methodName,
    status:        paymentStatusMap[result.status] ?? PaymentStatusEnum.Pending,
    transactionId: result.transactionId,
  });

  // ── 7. Création de la livraison ───────────────────────────────────────────
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

  // ── 8. Nettoyage du panier ─────────────────────────────────────────────────
  await CartItem.deleteMany({ cart: cart._id }).exec();

  // ── 9. Retour de la commande complète ──────────────────────────────────────
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