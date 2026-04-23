import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { paymentRegistry } from '../services/payment/PaymentProcessorRegistry';

const { ObjectId, Number: NumberType, String } = Schema.Types;

export enum PaymentStatusEnum {
  Pending    = 'PENDING',
  Processing = 'PROCESSING',
  Completed  = 'COMPLETED',
  Failed     = 'FAILED',
  Cancelled  = 'CANCELLED',
}

export interface PaymentDocument extends Document {
  order:         Types.ObjectId;
  amount:        number;
  method:        string;
  status:        string;
  transactionId: string;
}

const PaymentSchema = new Schema(
  {
    order: {
      type:     ObjectId,
      ref:      'Order',
      required: true,
    },
    amount: {
      type:     NumberType,
      required: true,
    },
    method: {
      type:     String,
      enum: {
        values:  paymentRegistry.getSupportedMethods(),
        message: `{{VALUE}} is not a supported payment method`,
      },
      required: true,
    },
    status: {
      type:    String,
      enum:    Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.Pending,
    },
    transactionId: {
      type:    String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<PaymentDocument>('Payment', PaymentSchema);