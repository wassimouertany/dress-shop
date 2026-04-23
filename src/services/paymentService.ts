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

// ─── helpers (inchangés) ──────────────────────────────────────────────────────

const cartItemsPopulate = {
  path: 'items',
  populate: { path: 'product' },
} as const;

const asPopulatedProduct = (ref: unknown): ProductDocument =>
  ref as ProductDocument;

// ─── processPayment ───────────────────────────────────────────────────────────

export const processPayment = async (
  userId: string,
  method: string,
  addressId: string,
  providerPayload: Record<string, unknown> = {}   // ← nouveau paramètre optionnel
): Promise<{
  order: OrderDocument;
  payment: PaymentDocument;
  livraison: LivraisonDocument;
}> => {

  // ── 1. Validation de la méthode via le registry (OCP) ──────────────────────
  if (!method) {
    throw new Error('Payment method is required');
  }

  const processor = paymentRegistry.get(method);  // lève Error si méthode inconnue
  processor.validate(providerPayload);             // validation spécifique au provider

  // ── 2. Validation de l'adresse (inchangée) ────────────────────────────────
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

  // ── 3. Validation du panier (inchangée) ───────────────────────────────────
  const cart = await Cart.findOne({ user: userId })
    .populate(cartItemsPopulate)
    .exec();

  if (!cart?.items?.length) {
    throw new Error('Cart is empty');
  }

  // ── 4. Calcul du total (inchangé) ─────────────────────────────────────────
  const total = cart.items.reduce(
    (acc, el) =>
      acc + asPopulatedProduct(el.product).price * el.quantity,
    0
  );

  // ── 5. Création de la commande (inchangée) ────────────────────────────────
  const order = await Order.create({
    user: userId,
    total,
    address: address._id,
  });

  await OrderItem.insertMany(
    cart.items.map((item) => ({
      order: order._id,
      quantity: item.quantity,
      product: asPopulatedProduct(item.product)._id ?? item.product,
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

  // ── 7. Création de la livraison (inchangée) ───────────────────────────────
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

  // ── 8. Nettoyage du panier (inchangé) ─────────────────────────────────────
  await CartItem.deleteMany({ cart: cart._id }).exec();

  // ── 9. Retour de la commande complète (inchangé) ──────────────────────────
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