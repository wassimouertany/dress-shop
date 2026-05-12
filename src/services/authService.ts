import { User, UserDocument } from '../models';
import { generateAuthToken, buildAuthPayload } from '../shared/tokenUtils';
import { ClientCreator, CreateClientData } from '../factories/UserFactory';

export const generateToken  = generateAuthToken;
export const buildAuthResponse = buildAuthPayload;

// ── Création utilisateur via Factory Method (GoF) ─────────────────────────────
// On choisit le ConcreteCreator (ClientCreator) par instanciation.
// La vérification d'unicité de l'email est désormais portée par
// UserCreator.registerUser() — opération "template" commune à tous les rôles.

export const createUser = async (data: CreateClientData): Promise<UserDocument> => {
  const creator = new ClientCreator();
  return creator.registerUser(data);
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