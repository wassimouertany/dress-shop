import { Product, ProductDocument } from '../models';
import APIFeatures from '../utils/ApiFeatures';
import { uploadImage } from '../shared/imageUpload';

export type ProductFields = {
  name: string;
  price: number | string;
  description: string;
  category: string;
  stockQuantity: number | string;
  isAvailable: boolean | string;
};

export type CreateProductInput = {
  name: string;
  price: number | string;
  description: string;
  category: string;
  stockQuantity?: number | string;
};

const coerceStockQuantity = (value: unknown): number =>
  value !== undefined && value !== '' ? Number(value) : 0;

export const listProducts = async (
  query: Record<string, unknown>
): Promise<{
  total: number;
  count: number;
  products: ProductDocument[];
}> => {
  const features = new APIFeatures(Product.find(), Product, query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query.exec();
  const total = await features.count().total;

  return {
    total,
    count: products.length,
    products,
  };
};

export const getProductWithRelated = async (
  id: string
): Promise<{
  product: ProductDocument;
  relatedProducts: ProductDocument[];
}> => {
  const product = await Product.findById(id).exec();

  if (!product) {
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: id },
  })
    .limit(8)
    .exec();

  return { product, relatedProducts };
};

export const createProduct = async (
  data: CreateProductInput,
  imageBuffer: Buffer
): Promise<ProductDocument> => {
  const { name, price, description, category, stockQuantity } = data;

  const imageURL = await uploadImage(imageBuffer, 'products', {
    width: 600,
    height: 600,
  });

  const qty = coerceStockQuantity(stockQuantity);

  return Product.create({
    name,
    price: typeof price === 'string' ? Number(price) : price,
    description,
    imageURL,
    category,
    stockQuantity: qty,
    isAvailable: qty > 0,
  });
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductFields>,
  imageBuffer?: Buffer
): Promise<ProductDocument> => {
  const product = await Product.findOne({ _id: id }).exec();

  if (!product) {
    throw new Error('Product not found');
  }

  const payload: Record<string, unknown> = {};

  const {
    name,
    price,
    description,
    category,
    stockQuantity,
    isAvailable,
  } = data;

  if (name !== undefined) {
    payload.name = name;
  }
  if (price !== undefined) {
    payload.price = typeof price === 'string' ? Number(price) : price;
  }
  if (description !== undefined) {
    payload.description = description;
  }
  if (category !== undefined) {
    payload.category = category;
  }
  if (stockQuantity !== undefined && stockQuantity !== '') {
    payload.stockQuantity = Number(stockQuantity);
  }

  if (isAvailable !== undefined) {
    payload.isAvailable =
      isAvailable === true ||
      isAvailable === 'true' ||
      String(isAvailable).toLowerCase() === 'true';
  }

  if (imageBuffer) {
    payload.imageURL = await uploadImage(imageBuffer, 'products', {
      width: 600,
      height: 600,
    });
  }

  const updated = await Product.findOneAndUpdate(
    { _id: product._id },
    payload,
    { new: true }
  ).exec();

  if (!updated) {
    throw new Error('Product not found');
  }

  return updated;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findOne({ _id: id }).exec();

  if (!product) {
    throw new Error('Product not found');
  }

  await Product.deleteOne({ _id: product._id }).exec();
};
