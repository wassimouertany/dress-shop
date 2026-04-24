import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import {
  processPayment,
  PaymentValidationError,
  ResourceNotFoundError,
} from '../services/paymentService';

const respondPaymentError = (res: Response, error: unknown): boolean => {
  if (error instanceof PaymentValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof ResourceNotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  return false;
};

export const payment = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { method, addressId, ...providerPayload } = req.body as {
      method?: string;
      addressId?: string;
      [key: string]: unknown;
    };

    const { order, payment, livraison } = await processPayment(
      String(user._id),
      method ?? '',
      addressId ?? '',
      providerPayload
    );

    res.status(200).json({
      data: { order, payment, livraison },
      success: true,
    });
  } catch (error) {
    if (respondPaymentError(res, error)) return;
    res.status(500).json({ message: 'Payment failed' });
  }
};