import { Request, Response } from 'express';
import { Adress } from '../models';
import { User as UserType } from '../types';

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const adresses = await Adress.find({ user: user._id }).sort('-createdAt');
    res.status(200).json({ data: adresses, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { region, city, street, postalCode, streetNumber } = req.body;

    const adress = await Adress.create({
      user: user._id,
      region,
      city,
      street,
      postalCode,
      streetNumber,
    });

    res.status(201).json({ data: adress, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error creating address' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserType;
    const { id } = req.params;

    const adress = await Adress.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!adress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};
