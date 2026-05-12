import { Product } from '../models';
import { IProductRepository } from '../interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
  async updateRating(productId: string, avgRating: number, reviewCount: number): Promise<void> {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
    }).exec();
  }
}
