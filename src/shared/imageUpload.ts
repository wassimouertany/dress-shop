import { Cloudinary } from '../lib/cloudinary';

export const uploadImage = (
  buffer: Buffer,
  folder: 'products' | 'categories',
  dimensions: { width: number; height: number }
): Promise<string> =>
  Cloudinary.uploadBuffer(buffer, folder, dimensions);
