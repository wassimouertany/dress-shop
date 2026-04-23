import mongoose from 'mongoose';
import { IPaymentProcessor, PaymentResult } from './IPaymentProcessor';

export class StripeProcessor implements IPaymentProcessor {
  readonly methodName = 'STRIPE';

  validate(payload: Record<string, unknown>): void {
    if (!payload['stripeToken'] && process.env.NODE_ENV === 'production') {
      throw new Error('Stripe: stripeToken is required');
    }
  }

  async process(amount: number, orderId: string): Promise<PaymentResult> {
    // Production : stripe.paymentIntents.create({ amount: amount*100 })
    console.log(`[Stripe] ${amount} pour commande ${orderId}`);
    return {
      transactionId: `STR-${new mongoose.Types.ObjectId().toString()}`,
      status: 'COMPLETED',
      providerResponse: { provider: 'stripe' },
    };
  }
}