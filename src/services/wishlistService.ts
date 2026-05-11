import { Wishlist, WishlistDocument, Product } from '../models';

export const getWishlistByUser = (
  userId: string
): Promise<WishlistDocument[]> =>
  Wishlist.find({ user: userId }).populate('product').exec();

export const addToWishlist = async (
  userId: string,
  productId: string
): Promise<WishlistDocument | null> => {
  // PRE-2 + INV-5 (insertion) - le produit doit exister, etre en stock,
  // et etre marque disponible. Projection minimale pour rester leger.
  const product = await Product
    .findById(productId)
    .select('isAvailable stockQuantity')
    .lean();

  if (!product) {
    throw new Error('Product not found');
  }
  if ((product as any).stockQuantity < 1) {
    throw new Error('PRE-2 violated: product out of stock');
  }
  if ((product as any).isAvailable === false) {
    throw new Error('INV-5 violated: product is not available');
  }

  // PRE-1 - pre-check applicatif (chemin nominal, message clair).
  const existing = await Wishlist.findOne({
    user: userId,
    product: productId,
  }).exec();

  if (existing) {
    throw new Error('Product is already in wishlist');
  }

  // INV-4 - filet de securite : si une requete concurrente passe entre
  // le findOne ci-dessus et le create ci-dessous, l'index unique
  // (user, product) levera E11000 que l'on retraduit en message metier.
  try {
    const newItem = await Wishlist.create({
      product: productId,
      user: userId,
    });

    return Wishlist.findById(newItem._id).populate('product').exec();
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new Error('Product is already in wishlist');
    }
    throw err;
  }
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
