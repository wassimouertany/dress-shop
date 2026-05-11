import {
  IProductSubject,
  IProductObserver,
  ProductAvailabilityChangedEvent,
} from './IProductObserver';

/* ===============================================
 GoF Observer Pattern — Concrete Subject (Product).
 Calqué sur ReviewEventEmitter pour rester cohérent.
 =================================================*/
export class ProductEventEmitter implements IProductSubject {
  private observers: IProductObserver[] = [];

  subscribe(observer: IProductObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: IProductObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async notifyObservers(event: ProductAvailabilityChangedEvent): Promise<void> {
    const results = await Promise.allSettled(
      this.observers.map((observer) => observer.onAvailabilityChanged(event))
    );

    results.forEach((result: PromiseSettledResult<void>, index: number) => {
      if (result.status === 'rejected') {
        const observerName = this.observers[index].constructor.name;
        console.error(
          `[ProductEventEmitter] Observer "${observerName}" threw an error:`,
          result.reason
        );
      }
    });
  }
}

// Singleton — importé dans productService (émission) et dans container.ts (câblage)
export const productEventEmitter = new ProductEventEmitter();
