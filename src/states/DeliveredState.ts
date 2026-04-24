import { ILivraisonState }              from '../interfaces/ILivraisonState';
import { LivraisonDocument, StatusEnum } from '../models/Livraison';

export class DeliveredState implements ILivraisonState {

  getStatus(): string {
    return StatusEnum.Delivered;
  }

  canTransitionTo(nextStatus: string): boolean {
    // ✅ FIX 3 : no-op autorisé si déjà DELIVERED
    return nextStatus === StatusEnum.Delivered;
  }

  handle(_livraison: LivraisonDocument, nextStatus: string): void {
    if (nextStatus === StatusEnum.Delivered) {
      // ✅ No-op : déjà DELIVERED, rien à faire
      return;
    }
    throw new Error(
      `Invalid transition: DELIVERED is a final state, cannot move to ${nextStatus}`
    );
  }
}