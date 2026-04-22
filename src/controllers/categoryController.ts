import { Request, Response } from 'express';
import { listCategories, createCategory } from '../services/categoryService';

export const index = async (req: Request, res: Response) => {
  try {
    const categories = await listCategories();
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

    const category = await createCategory(name, req.file.buffer);
    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating category' });
  }
};
