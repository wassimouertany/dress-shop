export interface IProductRepository {
  updateRating(productId: string, avgRating: number, reviewCount: number): Promise<void>;
}
