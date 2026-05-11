import { User, UserDocument } from '../models/User';
import { Client, ClientDocument } from '../models/Client';
import { Admin, AdminDocument }   from '../models/Admin';
import { Role } from '../types/Role';

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

// ─────────────────────────────────────────────────────────────────────────────
// Factory Method (GoF) — UserCreator est le Creator abstrait.
//
// Product           : UserDocument            (interface Mongoose)
// ConcreteProducts  : ClientDocument, AdminDocument
// Creator           : UserCreator             (abstrait, ci-dessous)
// ConcreteCreators  : ClientCreator, AdminCreator
//
// La décision "quel modèle instancier ?" est faite par le polymorphisme
// (override de `createUser`) et non plus par un switch.
// ─────────────────────────────────────────────────────────────────────────────

export abstract class UserCreator {
  /**
   * Factory method — redéfini par chaque ConcreteCreator pour décider
   * quel ConcreteProduct (ClientDocument / AdminDocument / …) instancier.
   */
  protected abstract createUser(data: CreateUserData): Promise<UserDocument>;

  /**
   * Opération "template" commune à tous les créateurs :
   *   pré-vérifications  →  factory method  →  (post-traitements éventuels)
   *
   * Définie ici une seule fois ; les sous-classes n'y touchent pas.
   */
  async registerUser(data: CreateUserData): Promise<UserDocument> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('Email is already taken');
    }
    return this.createUser(data);
  }
}

// ── ConcreteCreator : Client ─────────────────────────────────────────────────
export class ClientCreator extends UserCreator {
  protected createUser(data: CreateClientData): Promise<ClientDocument> {
    return Client.create({ ...data, role: Role.Client });
  }
}

// ── ConcreteCreator : Admin ──────────────────────────────────────────────────
export class AdminCreator extends UserCreator {
  protected createUser(data: CreateAdminData): Promise<AdminDocument> {
    return Admin.create({ ...data, role: Role.Admin });
  }
}
