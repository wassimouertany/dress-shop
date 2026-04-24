import { User, UserDocument } from '../models';
import { generateAuthToken, buildAuthPayload } from '../shared/tokenUtils';
import { Role } from '../types';
import { UserFactory, CreateClientData } from '../factories/UserFactory';

export const generateToken  = generateAuthToken;
export const buildAuthResponse = buildAuthPayload;

// ── Création utilisateur via UserFactory ──────────────────────────────────────

export const createUser = async (data: CreateClientData): Promise<UserDocument> => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new Error('Email is already taken');
  }
  // Avant : Client.create({ ...data, role: Role.Client })
  // Après : la Factory décide quel modèle instancier selon le rôle
  return UserFactory.create(Role.Client, data);
};

// ── Changement de mot de passe ────────────────────────────────────────────────

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