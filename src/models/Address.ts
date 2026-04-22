import { Schema, model, Document, Types } from 'mongoose';

const { ObjectId, String } = Schema.Types;

export interface AddressDocument extends Document {
  user: Types.ObjectId;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  streetNumber: string;
}

const AddressSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User',
    },
    region: String,
    city: String,
    street: String,
    postalCode: String,
    streetNumber: String,
  },
  {
    timestamps: true,
    collection: 'adresses',
  }
);

export const Address = model<AddressDocument>('Address', AddressSchema);
