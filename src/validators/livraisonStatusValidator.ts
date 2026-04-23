import { StatusEnum, LivraisonDocument } from '../models/Livraison';

export class LivraisonStatusValidator {

  private static readonly VALID_STATUSES: string[] = Object.values(StatusEnum);

  static isValid(status: string): boolean {
    return (
      typeof status === 'string' &&
      LivraisonStatusValidator.VALID_STATUSES.includes(status)
    );
  }

  static validate(status: string): void {
    if (!LivraisonStatusValidator.isValid(status)) {
      throw new Error('Invalid status');
    }
  }

  static requiresDeliveryDate(status: string): boolean {
    return status === StatusEnum.Delivered;
  }

  static applyTransition(
    livraison: LivraisonDocument,
    status:    StatusEnum
  ): void {
    livraison.status = status;
    if (LivraisonStatusValidator.requiresDeliveryDate(status)) {
      livraison.deliveredAt = new Date();
    }
  }
}