import { checkoutFacade } from './checkout/CheckoutFacade';

export { PaymentValidationError, ResourceNotFoundError } from './payment/paymentErrors';
export type { OrderResult } from './payment/OrderBuilder';

/**
 * Compat : même signature que l’ancienne API. Délègue à CheckoutFacade (GoF Facade).
 */
export const processPayment = (
  userId: string,
  method: string,
  addressId: string,
  providerPayload: Record<string, unknown> = {}
) => checkoutFacade.checkout(userId, method, addressId, providerPayload);
