import { Schema, model, Document, Types } from 'mongoose';

const {
  String,
  Number: NumberType,
  Boolean: BooleanType,
  ObjectId,
} = Schema.Types;

// 1. Updated Interface with optional rating fields
export interface ProductDocument extends Document {
  name: string;
  price: number;
  imageURL: string;
  category: Types.ObjectId;
  description: string;
  stockQuantity: number;
  isAvailable?: boolean;
  avgRating?: number;    // Added for review tracking
  reviewCount?: number;  // Added for review tracking
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
    // 2. Added Schema fields to persist rating data
    avgRating: { type: NumberType, default: 0 },
    reviewCount: { type: NumberType, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Search indexing for the name field
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

// Middleware to automatically toggle availability based on stock
productSchema.pre<ProductDocument>('save', function () {
  if (this.isModified('stockQuantity')) {
    this.isAvailable = this.stockQuantity > 0;
  }
});

// Update middleware to handle availability on direct updates
productSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as any;
  if (update?.stockQuantity !== undefined) {
    update.isAvailable = Number(update.stockQuantity) > 0;
  }
});

export const Product = model<ProductDocument>('Product', productSchema);