import { LivraisonRepository } from "./repositories/livraisonRepository";
import { OrderRepository } from "./repositories/orderRepository";
import { LivraisonOwnershipGuard } from "./guards/livraisonOwnershipGuard";
import { LivraisonService } from "./services/livraisonService";
import { LivraisonController } from "./controllers/livraisonController";

// GoF Observer Pattern - wire up review observers at application startup
import { reviewEventEmitter }        from './observers/ReviewEventEmitter';
import { ProductRatingObserver }     from './observers/ProductRatingObserver';
import { ReviewLoggerObserver }      from './observers/ReviewLoggerObserver';
import { ReviewRepository }          from './repositories/reviewRepository';
import { ProductRepository }         from './repositories/productRepository';

const reviewRepository = new ReviewRepository();
const productRepository = new ProductRepository();

reviewEventEmitter.subscribe(new ProductRatingObserver(reviewRepository, productRepository));
reviewEventEmitter.subscribe(new ReviewLoggerObserver());

// GoF Observer Pattern - wire up product-availability observers
// Maintient INV-5 sur Wishlist : si un produit devient indisponible, toutes
// les entrees de wishlist qui le referencent sont purgees automatiquement.
import { productEventEmitter }              from './observers/ProductEventEmitter';
import { WishlistAvailabilityObserver }     from './observers/WishlistAvailabilityObserver';

productEventEmitter.subscribe(new WishlistAvailabilityObserver());

// Repositories
const livraisonRepository = new LivraisonRepository();
const orderRepository = new OrderRepository();

// Guards
const ownershipGuard = new LivraisonOwnershipGuard(orderRepository);

// Services
const livraisonService = new LivraisonService(livraisonRepository, ownershipGuard);

// Controllers
export const livraisonController = new LivraisonController(livraisonService);
