import { Schema, model, Document, Types } from 'mongoose';
import { User } from './User';
import { Role } from '../types/Role';

const { ObjectId } = Schema.Types;

export interface WishlistDocument extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistSchema = new Schema(
  {
    // INV-3 - user non nul, et doit referencer un Client (pas un Admin)
    user: {
      type: ObjectId,
      ref: 'User',
      required: [true, 'INV-3: a wishlist must belong to a user'],
      validate: {
        validator: async function (userId: Types.ObjectId) {
          const u = await User.findById(userId).select('role').lean();
          return !!u && (u as { role?: Role }).role === Role.Client;
        },
        message: 'INV-3: wishlist owner must be a Client',
      },
    },
    product: {
      type: ObjectId,
      ref: 'Product',
      required: [true, 'A wishlist entry must reference a product'],
    },
  },
  {
    timestamps: true,
  }
);

// INV-4 - unicite (user, product) garantie en base (ferme la race condition
// que le check applicatif dans wishlistService laisse ouverte).
WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// INV-1 - assertion explicite : updatedAt >= createdAt.
// En pratique Mongoose le garantit deja via timestamps: true, mais on
// materialise l'invariant OCL au niveau du modele.
WishlistSchema.pre<WishlistDocument>('save', function (next) {
  if (this.updatedAt && this.createdAt && this.updatedAt < this.createdAt) {
    return next(new Error('INV-1 violated: updatedAt < createdAt'));
  }
  next();
});

export const Wishlist = model<WishlistDocument>('Wishlist', WishlistSchema);
