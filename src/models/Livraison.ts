import { Schema, model, Document, Model, Types } from 'mongoose';

const { ObjectId, String, Date: SchemaDate } = Schema.Types;

export enum StatusEnum {
  Shipped = 'SHIPPED',
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
}

export interface LivraisonDocument extends Document {
  order: Types.ObjectId;
  address: Types.ObjectId;
  status: string;
  trackingNumber: string;
  deliveredAt?: Date;
  applyStatusTransition(status: StatusEnum): void;
}

const LivraisonSchema = new Schema(
  {
    order: {
      type: ObjectId,
      ref: 'Order',
    },
    address: {
      type: ObjectId,
      ref: 'Address',
    },
    status: {
      type: String,
      enum: ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'],
      default: 'SHIPPED',
    },
    trackingNumber: String,
    deliveredAt: SchemaDate,
  },
  {
    timestamps: true,
  }
);

interface LivraisonModel extends Model<LivraisonDocument> {
  isValidStatus(status: string): boolean;
}

LivraisonSchema.statics.isValidStatus = function (status: string): boolean {
  return Object.values(StatusEnum).includes(status as StatusEnum);
};

LivraisonSchema.methods.applyStatusTransition = function (
  status: StatusEnum
): void {
  this.status = status;
  if (status === StatusEnum.Delivered) this.deliveredAt = new Date();
};

export const Livraison = model<LivraisonDocument, LivraisonModel>(
  'Livraison',
  LivraisonSchema
);
