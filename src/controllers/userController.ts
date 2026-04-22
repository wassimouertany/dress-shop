import { Request, Response } from 'express';
import { User } from '../models';
import { Role } from '../types';

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, numTel } = req.body;

    let user = await User.findById(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.id !== id) {
      return res.status(402).json({ message: 'Ops user id mismatch' });
    }

    const payload: Record<string, unknown> = { username, email };
    if (user.role === Role.Client) {
      if (fullName !== undefined) payload.fullName = fullName;
      if (numTel !== undefined) payload.numTel = numTel;
    }

    user = await User.findOneAndUpdate({ _id: id }, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error in updating user details' });
  }
};
