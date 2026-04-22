import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, Number: NumberType } = Schema.Types;

export interface OrderItemDocument extends Document {
  order: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
}

const OrderItemSchema = new Schema(
  {
    order: { type: ObjectId, ref: 'Order', required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    quantity: { type: NumberType, default: 1, min: 1 },
  },
  { timestamps: true }
);

OrderItemSchema.index({ order: 1, product: 1 });

export const OrderItem = model<OrderItemDocument>('OrderItem', OrderItemSchema);
