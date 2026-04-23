import { Product } from './Product';

export interface CartItem {
  quantity: number;
  product: Product;
}

export type Cart = {
  _id: string;
  items: CartItem[];
  user: string;
};
