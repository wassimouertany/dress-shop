import { Request, Response } from 'express';
import { Category } from '../models';
import { Cloudinary } from '../lib/cloudinary';

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
    const { name } = req.body;

    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageURL = await Cloudinary.uploadBuffer(
      req.file.buffer,
      'categories',
      { width: 400, height: 400 }
    );

    const category = await Category.create({ name, imageURL });
    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating category' });
  }
};
