import mongoose, { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, Number: NumberType, String } = Schema.Types;

export enum PaymentMethodEnum {
  Paypal = 'PAYPAL',
  Stripe = 'STRIPE',
}

export enum PaymentStatusEnum {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Cancelled = 'CANCELLED',
}

export interface PaymentDocument extends Document {
  order: Types.ObjectId;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
}

const PaymentSchema = new Schema(
  {
    order: {
      type: ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: NumberType,
      required: true,
    },
    method: {
      type: String,
      enum: ['PAYPAL', 'STRIPE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    transactionId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<PaymentDocument>('Payment', PaymentSchema);
