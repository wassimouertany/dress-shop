import { Client, ClientDocument } from '../models/Client';
import { Admin, AdminDocument }   from '../models/Admin';
import { Role } from '../types';

export type CreateClientData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  numTel: string;
};

export type CreateAdminData = {
  username: string;
  email: string;
  password: string;
};

export type CreateUserData = CreateClientData | CreateAdminData;

export class UserFactory {
  static create(role: Role.Client, data: CreateClientData): Promise<ClientDocument>;
  static create(role: Role.Admin,  data: CreateAdminData):  Promise<AdminDocument>;
  static create(role: Role, data: CreateUserData): Promise<ClientDocument | AdminDocument> {
    switch (role) {
      case Role.Client:
        return Client.create({ ...(data as CreateClientData), role: Role.Client });

      case Role.Admin:
        return Admin.create({ ...(data as CreateAdminData), role: Role.Admin });

      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }
}