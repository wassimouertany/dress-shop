import { UserDocument } from './User';
import { Schema, model, Document } from 'mongoose';
import type { CartItemDocument } from './CartItem';

const { ObjectId } = Schema.Types;

export interface CartDocument extends Document {
  user: UserDocument['_id'];
  items?: CartItemDocument[];
}

const CartSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CartSchema.virtual('items', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart',
  options: { sort: { createdAt: -1 } },
});

export const Cart = model<CartDocument>('Cart', CartSchema);
