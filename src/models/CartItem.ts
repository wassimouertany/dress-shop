import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, Number: NumberType } = Schema.Types;

export interface CartItemDocument extends Document {
  cart: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
}

const CartItemSchema = new Schema(
  {
    cart: { type: ObjectId, ref: 'Cart', required: true },
    product: { type: ObjectId, ref: 'Product', required: true },
    quantity: { type: NumberType, default: 1, min: 1 },
  },
  { timestamps: true }
);

CartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

export const CartItem = model<CartItemDocument>('CartItem', CartItemSchema);
