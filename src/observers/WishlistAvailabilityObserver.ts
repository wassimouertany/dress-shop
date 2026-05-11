import { IProductObserver, ProductAvailabilityChangedEvent } from './IProductObserver';
import { Wishlist } from '../models';

/*================================================
 GoF Observer Pattern — Concrete Observer.
 Maintient INV-5 sur Wishlist dans le temps : quand un
 produit devient indisponible, toutes les entrées de
 wishlist le référençant sont purgées.
 ===============================================*/
export class WishlistAvailabilityObserver implements IProductObserver {
  async onAvailabilityChanged(event: ProductAvailabilityChangedEvent): Promise<void> {
    if (event.isAvailable === false) {
      const result = await Wishlist.deleteMany({ product: event.productId }).exec();
      if (result.deletedCount && result.deletedCount > 0) {
        console.log(
          `[WishlistAvailabilityObserver] purged ${result.deletedCount} wishlist entry(ies) ` +
          `for unavailable product=${event.productId}`
        );
      }
    }
  }
}
