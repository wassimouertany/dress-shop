import { Request, Response, NextFunction } from 'express';
import { User as UserType } from '../types';
import { UserDocument } from '../models';
import passport from 'passport';
import {
  generateToken,
  buildAuthResponse,
  changePassword as changePasswordService,
} from '../services/authService';

export const sendResponseToken = ({
  user,
  res,
  statusCode,
}: {
  user: UserType | UserDocument;
  statusCode: number;
  res: Response;
}) => {
  res.status(statusCode).json({ data: buildAuthResponse(user), success: true });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'login',
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      sendResponseToken({ user, res, statusCode: 200 });
    }
  )(req, res, next);
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'signUp',
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      sendResponseToken({ user, res, statusCode: 201 });
    }
  )(req, res, next);
};

export const getMe = async (req: Request, res: Response) => {
  res.status(200).json({ data: { user: req.user } });
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { newPassword, oldPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(402).json({
        message: 'New Password and Confirm New Password does not match',
      });
    }

    const updatedUser = await changePasswordService(
      String(user._id),
      oldPassword,
      newPassword
    );

    sendResponseToken({ user: updatedUser, res, statusCode: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found ' });
      }
      if (error.message === 'Old password is incorrect') {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
    }
    res.status(500).json({ message: 'Error in updating password.' });
  }
};
