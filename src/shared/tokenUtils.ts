import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '../config';
import type { UserDocument } from '../models';
import type { TokenPayloadUser } from '../types';

export const generateAuthToken = (userId: string): string =>
  jwt.sign({ user_id: userId }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });

export const buildAuthPayload = (
  user: UserDocument | TokenPayloadUser
): { user: UserDocument | TokenPayloadUser; token: string } => {
  const token = generateAuthToken(user._id.toString());
  user.password = undefined;
  return { user, token };
};
