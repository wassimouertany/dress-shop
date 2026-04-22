import { Schema, model, Document, Types } from 'mongoose';
import type { OrderItemDocument } from './OrderItem';

const { ObjectId, Number: NumberType } = Schema.Types;

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items?: OrderItemDocument[];
  total: number;
  payment?: Types.ObjectId;
  livraison?: Types.ObjectId;
  address?: Types.ObjectId;
}

const OrderSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    total: NumberType,
    payment: {
      type: ObjectId,
      ref: 'Payment',
    },
    livraison: {
      type: ObjectId,
      ref: 'Livraison',
    },
    address: {
      type: ObjectId,
      ref: 'Address',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order',
  options: { sort: { createdAt: -1 } },
});

export const Order = model<OrderDocument>('Order', OrderSchema);
