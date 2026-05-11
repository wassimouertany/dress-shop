/* =====================================================
 GoF Observer Pattern — Observer interface (Product).
 Permet le maintien de INV-5 (Wishlist) dans le temps :
 quand un produit devient indisponible, les observateurs
 sont notifiés et peuvent réagir (ex. purge des wishlists).
 =======================================================*/
export interface IProductObserver {
  onAvailabilityChanged(event: ProductAvailabilityChangedEvent): Promise<void>;
}

export interface IProductSubject {
  subscribe(observer: IProductObserver): void;
  unsubscribe(observer: IProductObserver): void;
  notifyObservers(event: ProductAvailabilityChangedEvent): Promise<void>;
}

export interface ProductAvailabilityChangedEvent {
  productId: string;
  isAvailable: boolean;
}
