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

  // GRASP Creator — cart.buildCartItem() delegates the construction
  const itemData = cart.buildCartItem(productId, quantity);

  const cartItem = await CartItem.findOneAndUpdate(
    { cart: itemData.cart, product: itemData.product },
    { $inc: { quantity: itemData.quantity } },
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

  // Cart knows its own _id — use buildCartItem to get a consistent filter shape
  const { cart: cartId } = cart.buildCartItem(productId, 1);
  await CartItem.deleteOne({ cart: cartId, product: productId });

  return CartItem.find({ cart: cartId }).populate('product').exec();
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

  const { cart: cartId } = cart.buildCartItem(productId, quantity);

  const cartItem = await CartItem.findOneAndUpdate(
    { cart: cartId, product: productId },
    { $set: { quantity } },
    { new: true }
  ).populate('product');

  if (!cartItem) {
    throw new Error('Cart Item not found');
  }

  return cartItem;
};