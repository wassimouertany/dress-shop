import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import {
  getAddressesByUser,
  createAddress,
  deleteAddress,
} from '../services/addressService';

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const addresses = await getAddressesByUser(String(user._id));
    res.status(200).json({ data: addresses, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { region, city, street, postalCode, streetNumber } = req.body;
    const address = await createAddress(String(user._id), {
      region,
      city,
      street,
      postalCode,
      streetNumber,
    });
    res.status(201).json({ data: address, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error creating address' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { id } = req.params;
    const address = await deleteAddress(id, String(user._id));
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};