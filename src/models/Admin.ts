import { Schema } from 'mongoose';
import { User, UserDocument } from './User';

const AdminSchema = new Schema({});

export interface AdminDocument extends UserDocument {}

export const Admin = User.discriminator<AdminDocument>('Admin', AdminSchema);
