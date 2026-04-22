import { Livraison, Order, StatusEnum, LivraisonDocument } from '../models';

const STATUS_VALUES: string[] = [
  StatusEnum.Shipped,
  StatusEnum.InTransit,
  StatusEnum.Delivered,
];

export const getLivraisonByOrder = async (
  userId: string,
  orderId: string
): Promise<LivraisonDocument> => {
  const order = await Order.findOne({ _id: orderId, user: userId }).exec();

  if (!order) {
    throw new Error('Order not found');
  }

  const livraison = await Livraison.findOne({ order: orderId })
    .populate('address')
    .exec();

  if (!livraison) {
    throw new Error('Livraison not found');
  }

  return livraison;
};

export const updateLivraisonStatus = async (
  userId: string,
  livraisonId: string,
  status: string
): Promise<LivraisonDocument> => {
  if (!status || !STATUS_VALUES.includes(status)) {
    throw new Error('Invalid status');
  }

  const livraison = await Livraison.findById(livraisonId).exec();

  if (!livraison) {
    throw new Error('Livraison not found');
  }

  const order = await Order.findOne({
    _id: livraison.order,
    user: userId,
  }).exec();

  if (!order) {
    throw new Error('Not allowed');
  }

  const payload: Record<string, unknown> = { status };
  if (status === StatusEnum.Delivered) {
    payload.deliveredAt = new Date();
  }

  const updated = await Livraison.findByIdAndUpdate(livraisonId, payload, {
    new: true,
  })
    .populate('address')
    .exec();

  if (!updated) {
    throw new Error('Livraison not found');
  }

  return updated;
};
