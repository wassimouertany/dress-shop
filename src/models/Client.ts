import { Schema } from 'mongoose';
import { User, UserDocument } from './User';

const { String } = Schema.Types;

export interface ClientDocument extends UserDocument {
  fullName: string;
  numTel: string;
}

const ClientSchema = new Schema({
  fullName: String,
  numTel: String,
});

export const Client = User.discriminator<ClientDocument>('Client', ClientSchema);
