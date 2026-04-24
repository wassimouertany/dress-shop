// src/states/DeliveredState.ts
import { ILivraisonState } from '../interfaces/ILivraisonState';
import { LivraisonDocument, StatusEnum } from '../models/Livraison';

export class DeliveredState implements ILivraisonState {

  getStatus(): string {
    return StatusEnum.Delivered;
  }

  canTransitionTo(_nextStatus: string): boolean {
    // DELIVERED est un état final — aucune transition possible
    return false;
  }

  handle(_livraison: LivraisonDocument, nextStatus: string): void {
    throw new Error(
      `Invalid transition: DELIVERED is a final state, cannot move to ${nextStatus}`
    );
  }
}