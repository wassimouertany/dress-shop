export interface PaymentResult {
  transactionId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  providerResponse?: Record<string, unknown>;
}

export interface IPaymentProcessor {
  readonly methodName: string;
  process(amount: number, orderId: string): Promise<PaymentResult>;
  validate(payload: Record<string, unknown>): void;
}