import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ReviewRepository } from '../../src/repositories/reviewRepository';
import { Review, Product } from '../../src/models';

describe('ReviewRepository Integration', () => {
  let mongoServer: MongoMemoryServer;
  let reviewRepository: ReviewRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    reviewRepository = new ReviewRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Review.deleteMany({});
    await Product.deleteMany({});
  });

  it('should correctly aggregate the average rating and review count for a product', async () => {
    // 1. Create a dummy product
    const categoryId = new mongoose.Types.ObjectId();
    const product = await Product.create({
      name: 'Test Dress',
      price: 100,
      description: 'A beautiful dress',
      stockQuantity: 10,
      imageURL: 'http://example.com/image.png',
      category: categoryId,
    });

    // 2. Create 3 dummy reviews for the product
    const userId = new mongoose.Types.ObjectId();
    await Review.create([
      { product: product._id, user: userId, rating: 5, comment: 'Great!' },
      { product: product._id, user: userId, rating: 4, comment: 'Good' },
      { product: product._id, user: userId, rating: 3, comment: 'Okay' },
    ]);

    // 3. Call the repository method
    const result = await reviewRepository.aggregateAverageRating(product._id.toString());

    // 4. Verify mathematical correctness
    // (5 + 4 + 3) / 3 = 4
    expect(result).not.toBeNull();
    expect(result?.avgRating).toBe(4);
    expect(result?.count).toBe(3);
  });

  it('should return null if there are no reviews for a product', async () => {
    const dummyId = new mongoose.Types.ObjectId().toString();
    const result = await reviewRepository.aggregateAverageRating(dummyId);
    expect(result).toBeNull();
  });
});
