import { Role } from './Role';

export type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  carts: string[];
};

export type Client = User & {
  fullName: string;
  numTel: string;
};

export type Admin = User;
