import { Wishlist, WishlistDocument } from '../models';

export const getWishlistByUser = (
  userId: string
): Promise<WishlistDocument[]> =>
  Wishlist.find({ user: userId }).populate('product').exec();

export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistDocument | null> => {
  const existing = await Wishlist.findOne({
    user: userId,
    product: productId,
  }).exec();

  if (existing) {
    throw new Error('Product is already in wishlist');
  }

  const newItem = await Wishlist.create({
    product: productId,
    user: userId,
  });

  return Wishlist.findById(newItem._id).populate('product').exec();
};

export const removeFromWishlist = async (
  userId: string,
  productId: string
): Promise<void> => {
  const item = await Wishlist.findOne({
    user: userId,
    product: productId,
  }).exec();

  if (!item) {
    throw new Error('Product is not in your wishlist');
  }

  await Wishlist.deleteOne({ _id: item._id }).exec();
};
