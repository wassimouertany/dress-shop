/* =====================================================
 GoF Observer Pattern — Observer interface.
 =======================================================*/
export interface IReviewObserver {
  onReviewCreated(event: ReviewCreatedEvent): Promise<void>;
}

export interface IReviewSubject {
  subscribe(observer: IReviewObserver): void;
  unsubscribe(observer: IReviewObserver): void;
  notifyObservers(event: ReviewCreatedEvent): Promise<void>;
}

export interface ReviewCreatedEvent {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
}