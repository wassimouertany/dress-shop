import { Request, Response } from 'express';
import { IdentifiableUser } from '../types';
import { processPayment } from '../services/paymentService';

const respondPaymentError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const { message } = error;

  if (
    message === 'Invalid or missing method; use PAYPAL or STRIPE' ||
    message === 'addressId is required' ||
    message === 'Cart is empty'
  ) {
    res.status(400).json({ message });
    return true;
  }

  if (message === 'Address not found') {
    res.status(404).json({ message });
    return true;
  }

  return false;
};

export const payment = async (req: Request, res: Response) => {
  try {
    const user = req.user as IdentifiableUser;
    const { method, addressId } = req.body as {
      method?: string;
      addressId?: string;
    };

    const { order, payment, livraison } = await processPayment(
      String(user._id),
      method ?? '',
      addressId ?? ''
    );

    res.status(200).json({
      data: {
        order,
        payment,
        livraison,
      },
      success: true,
    });
  } catch (error) {
    if (respondPaymentError(res, error)) {
      return;
    }
    res.status(500).json({ message: 'Payment failed' });
  }
};
