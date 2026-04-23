import { IPaymentProcessor } from './IPaymentProcessor';
import { PaypalProcessor }  from './PaypalProcessor';
import { StripeProcessor }  from './StripeProcessor';

export class PaymentProcessorRegistry {
  private readonly processors = new Map<string, IPaymentProcessor>();

  register(processor: IPaymentProcessor): this {
    this.processors.set(processor.methodName.toUpperCase(), processor);
    return this;
  }

  get(method: string): IPaymentProcessor {
    const p = this.processors.get(method.toUpperCase());
    if (!p) {
      const list = this.getSupportedMethods().join(', ');
      throw new Error(`Unsupported payment method: "${method}". Supported: ${list}`);
    }
    return p;
  }

  getSupportedMethods(): string[] {
    return Array.from(this.processors.keys());
  }
}

export const paymentRegistry = new PaymentProcessorRegistry()
  .register(new PaypalProcessor())
  .register(new StripeProcessor());