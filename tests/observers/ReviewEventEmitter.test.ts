import { ReviewEventEmitter } from '../../src/observers/ReviewEventEmitter';
import { IReviewObserver, ReviewCreatedEvent } from '../../src/observers/IReviewObserver';

class MockObserver implements IReviewObserver {
  onReviewCreated = jest.fn().mockResolvedValue(undefined);
}

class FailingObserver implements IReviewObserver {
  onReviewCreated = jest.fn().mockRejectedValue(new Error('Observer failed'));
}

describe('ReviewEventEmitter', () => {
  let emitter: ReviewEventEmitter;

  beforeEach(() => {
    emitter = new ReviewEventEmitter();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress error logs in test output
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should allow subscribing observers', async () => {
    const observer1 = new MockObserver();
    const observer2 = new MockObserver();

    emitter.subscribe(observer1);
    emitter.subscribe(observer2);

    const event: ReviewCreatedEvent = { reviewId: '1', productId: 'p1', userId: 'u1', rating: 5 };
    await emitter.notifyObservers(event);

    expect(observer1.onReviewCreated).toHaveBeenCalledWith(event);
    expect(observer2.onReviewCreated).toHaveBeenCalledWith(event);
  });

  it('should allow unsubscribing observers', async () => {
    const observer1 = new MockObserver();
    
    emitter.subscribe(observer1);
    emitter.unsubscribe(observer1);

    const event: ReviewCreatedEvent = { reviewId: '1', productId: 'p1', userId: 'u1', rating: 5 };
    await emitter.notifyObservers(event);

    expect(observer1.onReviewCreated).not.toHaveBeenCalled();
  });

  it('should handle observer errors without throwing using Promise.allSettled', async () => {
    const failingObserver = new FailingObserver();
    const passingObserver = new MockObserver();

    emitter.subscribe(failingObserver);
    emitter.subscribe(passingObserver);

    const event: ReviewCreatedEvent = { reviewId: '1', productId: 'p1', userId: 'u1', rating: 5 };
    
    // This should not throw an exception
    await expect(emitter.notifyObservers(event)).resolves.toBeUndefined();

    // The passing observer should still have been called
    expect(passingObserver.onReviewCreated).toHaveBeenCalledWith(event);

    // Verify the error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('threw an error:'),
      expect.any(Error)
    );
  });
});
