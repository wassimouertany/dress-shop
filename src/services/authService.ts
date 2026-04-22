import { User, UserDocument } from '../models';
import {
  generateAuthToken,
  buildAuthPayload,
} from '../shared/tokenUtils';

export const generateToken = generateAuthToken;
export const buildAuthResponse = buildAuthPayload;

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<UserDocument> => {
  const foundUser = await User.findById(userId).select('+password');

  if (!foundUser) {
    throw new Error('User not found');
  }

  const isPasswordCorrect = await foundUser.matchesPassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new Error('Old password is incorrect');
  }

  foundUser.password = newPassword;
  await foundUser.save();

  return foundUser;
};
