import { Request, Response } from 'express';
import { Category } from '../models';

export const index = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting categories' });
  }
};


export const store = async (req: Request, res: Response) => {
  try {
    const { name, imageURL } = req.body;
    const category = await Category.create({ name, imageURL });
    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating category' });
  }
};