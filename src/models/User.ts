import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../types';

const { String } = Schema.Types;

export interface UserDocument extends Document {
  username: string;
  email: string;
  password?: string;
  role: Role;
  matchesPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: [Role.Client, Role.Admin],
    },
  },
  {
    timestamps: true,
    discriminatorKey: '__t',
  }
);

UserSchema.pre<UserDocument>('save', async function () {
  if (this.isModified('password')) {
    if (this.password) {
      const hash = await bcrypt.hashSync(this.password.toString(), 10);
      this.password = hash;
    }
  }
});

UserSchema.methods.matchesPassword = function (password: string) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compareSync(password, this.password);
};

export const User = model<UserDocument>('User', UserSchema);
