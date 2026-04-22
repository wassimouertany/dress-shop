import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, Number: NumberType } = Schema.Types;

export interface OrderItem {
  quantity: number;
  product: Types.ObjectId;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  items: OrderItem[];
  total: number;
  payment?: Types.ObjectId;
  livraison?: Types.ObjectId;
  adress?: Types.ObjectId;
}

const OrderSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    items: [
      {
        quantity: {
          type: NumberType,
          default: 1,
        },
        product: {
          type: ObjectId,
          ref: 'Product',
        },
      },
    ],
    total: NumberType,
    payment: {
      type: ObjectId,
      ref: 'Payment',
    },
    livraison: {
      type: ObjectId,
      ref: 'Livraison',
    },
    adress: {
      type: ObjectId,
      ref: 'Adress',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<OrderDocument>('Order', OrderSchema);
