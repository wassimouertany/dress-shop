import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '../config';
import type { UserDocument } from '../models';
import type { User } from '../types';

export const generateAuthToken = (userId: string): string =>
  jwt.sign({ user_id: userId }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });

export const buildAuthPayload = (
  user: UserDocument | User
): { user: UserDocument | User; token: string } => {
  const token = generateAuthToken(user._id.toString());
  (user as { password?: string }).password = undefined;
  return { user, token };
};
