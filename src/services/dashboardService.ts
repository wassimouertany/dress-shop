import { Product, User, Order } from '../models';

export type DashboardStats = {
  products: number;
  users: number;
  orders: number;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [products, users, orders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
  ]);
  return { products, users, orders };
};