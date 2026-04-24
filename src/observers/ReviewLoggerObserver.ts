import { IReviewObserver, ReviewCreatedEvent } from './IReviewObserver';

/*================================================
 GoF Observer Pattern — Concrete Observer
 ===============================================*/
export class ReviewLoggerObserver implements IReviewObserver {
  async onReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    console.log(
      `[REVIEW] user=${event.userId} gave rating=${event.rating} ` +
      `on product=${event.productId} (reviewId=${event.reviewId})`
    );
  }
}

