// src/states/InTransitState.ts
import { ILivraisonState } from '../interfaces/ILivraisonState';
import { LivraisonDocument, StatusEnum } from '../models/Livraison';

export class InTransitState implements ILivraisonState {

  getStatus(): string {
    return StatusEnum.InTransit;
  }

  canTransitionTo(nextStatus: string): boolean {
    // IN_TRANSIT → seul DELIVERED est autorisé
    return nextStatus === StatusEnum.Delivered;
  }

  handle(livraison: LivraisonDocument, nextStatus: string): void {
    if (!this.canTransitionTo(nextStatus)) {
      throw new Error(
        `Invalid transition: cannot move from IN_TRANSIT to ${nextStatus}`
      );
    }
    livraison.status = nextStatus;
    // IN_TRANSIT n'a pas de champ spécifique à modifier
  }
}