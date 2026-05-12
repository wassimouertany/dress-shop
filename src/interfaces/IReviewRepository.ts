export interface IReviewRepository {
  aggregateAverageRating(productId: string): Promise<{ avgRating: number; count: number } | null>;
}
