import { Request, Response } from 'express';
import { Product } from '../models';
import APIFeatures from '../utils/ApiFeatures';
import { Cloudinary } from '../lib/cloudinary';

export const index = async (req: Request, res: Response) => {
  try {
    const features = new APIFeatures(Product.find(), Product, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query;

    const total = await features.count().total;

    res.status(200).json({ data: { total, count: products.length, products } });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting products' });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // find related products based on product category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
    }).limit(8);

    res.status(200).json({ data: { product, relatedProducts } });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting product' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, stockQuantity } = req.body;

    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageURL = await Cloudinary.uploadBuffer(req.file.buffer, 'products', {
      width: 600,
      height: 600,
    });

    const qty =
      stockQuantity !== undefined && stockQuantity !== ''
        ? Number(stockQuantity)
        : 0;

    const product = await Product.create({
      name,
      price: typeof price === 'string' ? Number(price) : price,
      description,
      imageURL,
      category,
      stockQuantity: qty,
      isAvailable: qty > 0,
    });

    res.status(200).json({ data: { product } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error in creating product' });
  }
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;

  let product = await Product.findOne({ _id: id });

  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.remove();

  res.status(204).json({ data: null });
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let product = await Product.findOne({ _id: id });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const payload: Record<string, unknown> = {};

    const {
      name,
      price,
      description,
      category,
      stockQuantity,
      isAvailable,
    } = req.body;

    if (name !== undefined) payload.name = name;
    if (price !== undefined) {
      payload.price = typeof price === 'string' ? Number(price) : price;
    }
    if (description !== undefined) payload.description = description;
    if (category !== undefined) payload.category = category;
    if (stockQuantity !== undefined && stockQuantity !== '') {
      payload.stockQuantity = Number(stockQuantity);
    }
    if (isAvailable !== undefined) {
      payload.isAvailable =
        isAvailable === true ||
        isAvailable === 'true' ||
        String(isAvailable).toLowerCase() === 'true';
    }

    if (req.file?.buffer) {
      const imageURL = await Cloudinary.uploadBuffer(req.file.buffer, 'products', {
        width: 600,
        height: 600,
      });
      payload.imageURL = imageURL;
    }

    product = await Product.findOneAndUpdate({ _id: product._id }, payload, {
      new: true,
    });

    res.status(200).json({ data: { product } });
  } catch (error) {
    res.status(500).json({ message: 'Error in creating product' });
  }
};
