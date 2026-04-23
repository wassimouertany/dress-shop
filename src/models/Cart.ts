import { UserDocument } from './User';
import { Schema, model, Document } from 'mongoose';
import type { CartItemDocument } from './CartItem';

const { ObjectId } = Schema.Types;

export interface CartDocument extends Document {
  user: UserDocument['_id'];
  items?: CartItemDocument[];
  calculateTotal(): number;
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

CartSchema.methods.calculateTotal = function (): number {
  if (!this.items?.length) return 0;
  return this.items.reduce(
    (acc: number, item: any) => acc + item.product.price * item.quantity,
    0
  );
};

export const Cart = model<CartDocument>('Cart', CartSchema);
