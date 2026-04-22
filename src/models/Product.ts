import { Schema, model, Document, Types } from 'mongoose';

const {
  String,
  Number: NumberType,
  Boolean: BooleanType,
  ObjectId,
} = Schema.Types;

export interface ProductDocument extends Document {
  name: string;
  price: number;
  imageURL: string;
  category: Types.ObjectId;
  description: string;
  stockQuantity: number;
  isAvailable: boolean;
}

const productSchema = new Schema(
  {
    name: String,
    price: NumberType,
    imageURL: String,
    category: {
      type: ObjectId,
      ref: 'Category',
    },
    description: String,
    stockQuantity: { type: NumberType, default: 0 },
    isAvailable: { type: BooleanType, default: true },
  },
  {
    timestamps: true,
  }
);

productSchema.index(
  {
    name: 'text',
  },
  {
    weights: {
      name: 3,
    },
  }
);

export const Product = model<ProductDocument>('Product', productSchema);
