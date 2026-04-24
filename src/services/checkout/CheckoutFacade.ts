import { Cart } from '../../models';
import { Address } from '../../models/Address';
import { PaymentProcessorRegistry, paymentRegistry } from '../payment/PaymentProcessorRegistry';
import { OrderBuilder, BuilderStateError, OrderResult } from '../payment/OrderBuilder';
import { PaymentValidationError, ResourceNotFoundError } from '../payment/paymentErrors';

export class CheckoutFacade {
  constructor(private readonly registry: PaymentProcessorRegistry) {}

  async checkout(
    userId: string,
    method: string,
    addressId: string,
    providerPayload: Record<string, unknown> = {}
  ): Promise<OrderResult> {
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
        .setProcessor(this.registry.get(method))
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
  }
}

export const checkoutFacade = new CheckoutFacade(paymentRegistry);
