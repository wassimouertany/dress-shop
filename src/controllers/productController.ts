import { Request, Response } from 'express';
import {
  listProducts,
  getProductWithRelated,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

export const index = async (req: Request, res: Response) => {
  try {
    const { total, count, products } = await listProducts(req.query);
    res.status(200).json({ data: { total, count, products } });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting products' });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { product, relatedProducts } = await getProductWithRelated(id);
    res.status(200).json({ data: { product, relatedProducts } });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Error in getting product' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { name, price, description, category, stockQuantity } = req.body;
    const product = await createProduct(
      { name, price, description, category, stockQuantity },
      req.file.buffer
    );

    res.status(200).json({ data: { product } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error in creating product' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(204).json({ data: null });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Error in deleting product' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await updateProduct(id, req.body, req.file?.buffer);
    res.status(200).json({ data: { product } });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Error in creating product' });
  }
};
