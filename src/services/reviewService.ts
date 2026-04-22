import { Review, Product, ReviewDocument } from '../models';

export const createReview = async (
  userId: string,
  productId: string | undefined,
  rating: unknown,
  comment: string | undefined
): Promise<ReviewDocument | null> => {
  if (!productId || rating === undefined || rating === null) {
    throw new Error('product and rating are required');
  }

  const product = await Product.findById(productId).exec();

  if (!product) {
    throw new Error('Product not found');
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating: Number(rating),
    comment: comment ?? '',
  });

  return Review.findById(review._id).populate('user').exec();
};

export const getReviewsByProduct = (
  productId: string
): Promise<ReviewDocument[]> =>
  Review.find({ product: productId })
    .populate('user', 'username email')
    .sort('-createdAt')
    .exec();
