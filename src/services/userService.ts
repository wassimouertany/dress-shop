import { User, UserDocument } from '../models';
import { Role } from '../types';

export type UpdateUserProfileData = {
  username: string;
  email: string;
  fullName?: string;
  numTel?: string;
};

export const updateUserProfile = async (
  id: string,
  data: UpdateUserProfileData,
  role: Role
): Promise<UserDocument | null> => {
  void role;

  const user = await User.findById(id).exec();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.id !== id) {
    throw new Error('User id mismatch');
  }

  const payload: Record<string, unknown> = {
    username: data.username,
    email: data.email,
  };

  if (user.role === Role.Client) {
    if (data.fullName !== undefined) {
      payload.fullName = data.fullName;
    }
    if (data.numTel !== undefined) {
      payload.numTel = data.numTel;
    }
  }

  return User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  }).exec();
};
