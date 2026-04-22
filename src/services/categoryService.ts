import { Category, CategoryDocument } from '../models';
import { uploadImage } from '../shared/imageUpload';

export const listCategories = (): Promise<CategoryDocument[]> =>
  Category.find().exec();

export const createCategory = async (
  name: string,
  imageBuffer: Buffer
): Promise<CategoryDocument> => {
  const imageURL = await uploadImage(imageBuffer, 'categories', {
    width: 400,
    height: 400,
  });

  return Category.create({ name, imageURL });
};
