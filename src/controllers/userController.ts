import { Request, Response } from 'express';
import { AuthenticatedUser } from '../types';
import { updateUserProfile } from '../services/userService';

const mapUserError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.message.toLowerCase().includes('not found')) {
    res.status(404).json({ message: 'User not found' });
    return true;
  }

  if (error.message.toLowerCase().includes('mismatch')) {
    res.status(402).json({ message: 'Ops user id mismatch' });
    return true;
  }

  return false;
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, numTel } = req.body;
    const auth = req.user as AuthenticatedUser;
    const user = await updateUserProfile(
      id,
      { username, email, fullName, numTel },
      auth.role
    );
    res.status(200).json({ data: user });
  } catch (error) {
    if (mapUserError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Error in updating user details' });
  }
};
