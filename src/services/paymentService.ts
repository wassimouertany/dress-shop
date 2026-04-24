import { Cart } from '../models';
import { Address } from '../models/Address';
import { paymentRegistry } from './payment/PaymentProcessorRegistry';
import { OrderBuilder, BuilderStateError, OrderResult } from './payment/OrderBuilder';

// ── Erreurs typées ────────────────────────────────────────────────────────────

export class PaymentValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

export class ResourceNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

// ── processPayment ────────────────────────────────────────────────────────────

export const processPayment = async (
  userId: string,
  method: string,
  addressId: string,
  providerPayload: Record<string, unknown> = {}
): Promise<OrderResult> => {
  if (!method) {
    throw new PaymentValidationError('Payment method is required');
  }

  if (!addressId) {
    throw new PaymentValidationError('addressId is required');
  }

  const address = await Address.findOne({ _id: addressId, user: userId }).exec();
  if (!address) {
    throw new ResourceNotFoundError('Address not found');
  }

  const cart = await Cart.findOne({ user: userId })
    .populate({ path: 'items', populate: { path: 'product' } })
    .exec();

  try {
    return await new OrderBuilder()
      .setProviderPayload(providerPayload)
      .setProcessor(paymentRegistry.get(method))
      .setAddress(address)
      .setCart(cart!)
      .build();
  } catch (error) {
    if (error instanceof BuilderStateError) {
      throw new PaymentValidationError(error.message);
    }
    if (error instanceof Error) {
      throw new PaymentValidationError(error.message);
    }
    throw error;
  }
};
