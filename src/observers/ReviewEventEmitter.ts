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
    const results = await Promise.allSettled(
      this.observers.map((observer) => observer.onReviewCreated(event))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const observerName = this.observers[index].constructor.name;
        console.error(
          `[ReviewEventEmitter] Observer "${observerName}" threw an error:`,
          result.reason
        );
      }
    });
  }
}

// Singleton — import this in reviewService and in container.ts 
export const reviewEventEmitter = new ReviewEventEmitter();