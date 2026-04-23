import mongoose from 'mongoose';
import { IPaymentProcessor, PaymentResult } from './IPaymentProcessor';

export class PaypalProcessor implements IPaymentProcessor {
  readonly methodName = 'PAYPAL';

  validate(payload: Record<string, unknown>): void {
    if (!payload['paypalOrderId'] && process.env.NODE_ENV === 'production') {
      throw new Error('PayPal: paypalOrderId is required');
    }
  }

  async process(amount: number, orderId: string): Promise<PaymentResult> {
    // Production : appel SDK @paypal/checkout-server-sdk ici
    console.log(`[PayPal] ${amount} pour commande ${orderId}`);
    return {
      transactionId: `PP-${new mongoose.Types.ObjectId().toString()}`,
      status: 'COMPLETED',
      providerResponse: { provider: 'paypal' },
    };
  }
}