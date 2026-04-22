import { ProductDocument } from './Product';
import { UserDocument } from './User';
import { Schema, model, Document } from 'mongoose';

const { ObjectId, Number } = Schema.Types;

export interface CartItem {
  quantity: number;
  product: ProductDocument['_id'];
}

export interface CartDocument extends Document {
  user: UserDocument['_id'];
  items: CartItem[];
}

const CartSchema = new Schema(
  {
    // Client uses User discriminator; ref stays 'User'
    user: {
      type: ObjectId,
      ref: 'User',
    },
    items: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: ObjectId,
          ref: 'Product',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Cart = model<CartDocument>('Cart', CartSchema);
