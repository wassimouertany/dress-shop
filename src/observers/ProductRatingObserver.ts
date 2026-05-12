import { IReviewObserver, ReviewCreatedEvent } from './IReviewObserver';
import { IReviewRepository } from '../interfaces/IReviewRepository';
import { IProductRepository } from '../interfaces/IProductRepository';

/*================================================
 GoF Observer Pattern — Concrete Observer
 ===============================================*/
export class ProductRatingObserver implements IReviewObserver {
  constructor(
    private reviewRepository: IReviewRepository,
    private productRepository: IProductRepository
  ) {}

  async onReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    const { productId } = event;

    // Aggregate all ratings for this product from the DB using Repository
    const result = await this.reviewRepository.aggregateAverageRating(productId);

    if (!result) return;

    const { avgRating, count } = result;

    // Persist the computed average back on the Product document using Repository
    await this.productRepository.updateRating(productId, avgRating, count);
  }
}