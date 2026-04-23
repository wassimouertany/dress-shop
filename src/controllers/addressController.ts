import { Request, Response } from 'express';
import { Address } from '../models/Address'; // On pointe le fichier précis
import { IdentifiableUser } from '../types';

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const addresses = await Address.find({ user: user._id }).sort('-createdAt');
    res.status(200).json({ data: addresses, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { region, city, street, postalCode, streetNumber } = req.body;

    const address = await Address.create({
      user: user._id,
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

    const address = await Address.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};
