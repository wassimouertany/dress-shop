// src/validators/livraisonStatusValidator.ts
// Ce validator est simplifié : il vérifie uniquement que le status
// est une valeur connue. La logique de TRANSITION est maintenant
// dans LivraisonContext (State Pattern).
import { StatusEnum } from '../models/Livraison';

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
}