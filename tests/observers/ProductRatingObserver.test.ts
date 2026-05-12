import { ProductRatingObserver } from '../../src/observers/ProductRatingObserver';
import { IReviewRepository } from '../../src/interfaces/IReviewRepository';
import { IProductRepository } from '../../src/interfaces/IProductRepository';
import { ReviewCreatedEvent } from '../../src/observers/IReviewObserver';

describe('ProductRatingObserver', () => {
  let mockReviewRepository: jest.Mocked<IReviewRepository>;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let observer: ProductRatingObserver;

  beforeEach(() => {
    mockReviewRepository = {
      aggregateAverageRating: jest.fn(),
    };

    mockProductRepository = {
      updateRating: jest.fn(),
    };

    observer = new ProductRatingObserver(mockReviewRepository, mockProductRepository);
  });

  it('should aggregate reviews and update product rating', async () => {
    // Arrange
    const event: ReviewCreatedEvent = { reviewId: '1', productId: 'p1', userId: 'u1', rating: 5 };
    mockReviewRepository.aggregateAverageRating.mockResolvedValue({ avgRating: 4.5, count: 2 });
    mockProductRepository.updateRating.mockResolvedValue(undefined);

    // Act
    await observer.onReviewCreated(event);

    // Assert
    expect(mockReviewRepository.aggregateAverageRating).toHaveBeenCalledWith('p1');
    expect(mockProductRepository.updateRating).toHaveBeenCalledWith('p1', 4.5, 2);
  });

  it('should not update product rating if no reviews are found', async () => {
    // Arrange
    const event: ReviewCreatedEvent = { reviewId: '1', productId: 'p1', userId: 'u1', rating: 5 };
    mockReviewRepository.aggregateAverageRating.mockResolvedValue(null);

    // Act
    await observer.onReviewCreated(event);

    // Assert
    expect(mockReviewRepository.aggregateAverageRating).toHaveBeenCalledWith('p1');
    expect(mockProductRepository.updateRating).not.toHaveBeenCalled();
  });
});
