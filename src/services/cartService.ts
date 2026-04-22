import { Cart, CartItem, CartDocument, CartItemDocument } from '../models';

const itemsPopulate = {
  path: 'items',
  populate: { path: 'product' },
} as const;

export const getCartByUser = (userId: string): Promise<CartDocument | null> =>
  Cart.findOne({ user: userId }).populate(itemsPopulate).exec();

export const getOrCreateCart = async (userId: string): Promise<CartDocument> => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId });
    return cart;
  }

  if (cart.user.toString() !== userId) {
    throw new Error('Cart does not belong to this user');
  }

  return cart;
};

export const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemDocument> => {
  const cart = await getOrCreateCart(userId);

  const cartItem = await CartItem.findOneAndUpdate(
    { cart: cart._id, product: productId },
    { $inc: { quantity } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('product');

  if (!cartItem) {
    throw new Error('Cart Item not found');
  }

  return cartItem;
};

export const removeItemFromCart = async (
  userId: string,
  productId: string
): Promise<CartItemDocument[]> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  await CartItem.deleteOne({ cart: cart._id, product: productId });

  return CartItem.find({ cart: cart._id }).populate('product').exec();
};

export const updateItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemDocument> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error('Cart not found');
  }

  if (cart.user.toString() !== userId) {
    throw new Error('Cart does not belong to this user');
  }

  const cartItem = await CartItem.findOneAndUpdate(
    { cart: cart._id, product: productId },
    { $set: { quantity } },
    { new: true }
  ).populate('product');

  if (!cartItem) {
    throw new Error('Cart Item not found');
  }

  return cartItem;
};
