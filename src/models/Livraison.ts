import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, String: SchemaString, Date: SchemaDate } = Schema.Types;

export enum StatusEnum {
  Shipped   = 'SHIPPED',
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
}

export interface LivraisonDocument extends Document {
  order:          Types.ObjectId;
  address:        Types.ObjectId;
  status:         string;
  trackingNumber: string;
  deliveredAt?:   Date;
}

const LivraisonSchema = new Schema(
  {
    order:          { type: ObjectId, ref: 'Order' },
    address:        { type: ObjectId, ref: 'Address' },
    status: {
      type:    SchemaString,
      enum:    ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'],
      default: 'SHIPPED',
    },
    trackingNumber: SchemaString,
    deliveredAt:    SchemaDate,
  },
  { timestamps: true }
);

export const Livraison = model<LivraisonDocument>('Livraison', LivraisonSchema);