// src/states/ShippedState.ts
import { ILivraisonState } from '../interfaces/ILivraisonState';
import { LivraisonDocument, StatusEnum } from '../models/Livraison';

export class ShippedState implements ILivraisonState {

  getStatus(): string {
    return StatusEnum.Shipped;
  }

  canTransitionTo(nextStatus: string): boolean {
    // SHIPPED → seul IN_TRANSIT est autorisé
    return nextStatus === StatusEnum.InTransit;
  }

  handle(livraison: LivraisonDocument, nextStatus: string): void {
    if (!this.canTransitionTo(nextStatus)) {
      throw new Error(
        `Invalid transition: cannot move from SHIPPED to ${nextStatus}`
      );
    }
    livraison.status = nextStatus;
  }
}