import { IReviewSubject, IReviewObserver, ReviewCreatedEvent } from './IReviewObserver';

/* ===============================================
 GoF Observer Pattern — Concrete Subject.
 =================================================*/
export class ReviewEventEmitter implements IReviewSubject {
  private observers: IReviewObserver[] = [];

  subscribe(observer: IReviewObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: IReviewObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async notifyObservers(event: ReviewCreatedEvent): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.onReviewCreated(event);
      } catch (err) {
        // An observer failure must NEVER crash the main review-creation flow
        // Log and continue
        console.error(
          `[ReviewEventEmitter] Observer "${observer.constructor.name}" threw an error:`,
          err
        );
      }
    }
  }
}

// Singleton — import this in reviewService and in container.ts 
export const reviewEventEmitter = new ReviewEventEmitter();