import { Role } from './Role';

export type IdentifiableUser = { _id: string };
export type AuthenticatedUser = { _id: string; role: Role };
export type TokenPayloadUser = { _id: string; password?: string };

/** @deprecated */
export type User = AuthenticatedUser & {
  username: string;
  email: string;
  password: string;
  carts: string[];
};

export type Client = User & {
  fullName: string;
  numTel: string;
};

export type Admin = User;
