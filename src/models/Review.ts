import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, Number: NumberType, String } = Schema.Types;

export interface ReviewDocument extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    product: {
      type: ObjectId,
      ref: 'Product',
    },
    rating: {
      type: NumberType,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String,
  },
  {
    timestamps: true,
  }
);

export const Review = model<ReviewDocument>('Review', ReviewSchema);
