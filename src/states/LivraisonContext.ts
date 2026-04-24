// src/states/LivraisonContext.ts
import { LivraisonDocument, StatusEnum } from '../models/Livraison';
import { ILivraisonState }               from '../interfaces/ILivraisonState';
import { ShippedState }                  from './ShippedState';
import { InTransitState }                from './InTransitState';
import { DeliveredState }                from './DeliveredState';

/**
 * LivraisonContext orchestre les transitions d'état.
 * C'est le seul endroit où la logique "quel état courant ?"
 * est résolue — le service n'a plus à le faire.
 */
export class LivraisonContext {

  private currentState: ILivraisonState;

  constructor(private readonly livraison: LivraisonDocument) {
    this.currentState = LivraisonContext.resolveState(livraison.status);
  }

  /**
   * Construit l'objet état correspondant au status string du document.
   */
  static resolveState(status: string): ILivraisonState {
    switch (status) {
      case StatusEnum.Shipped:   return new ShippedState();
      case StatusEnum.InTransit: return new InTransitState();
      case StatusEnum.Delivered: return new DeliveredState();
      default:
        throw new Error(`Unknown livraison status: ${status}`);
    }
  }

  /**
   * Effectue la transition vers nextStatus.
   * Délègue la validation et l'application à l'état courant.
   * Met à jour deliveredAt si on arrive sur DELIVERED.
   */
  transition(nextStatus: string): void {
    // Délègue : l'état courant décide si c'est légal et applique le changement
    this.currentState.handle(this.livraison, nextStatus);

    // Cas spécial DELIVERED : on enregistre la date de livraison
    if (nextStatus === StatusEnum.Delivered) {
      this.livraison.deliveredAt = new Date();
    }

    // L'état courant change pour refléter le nouveau statut
    this.currentState = LivraisonContext.resolveState(nextStatus);
  }

  /**
   * Retourne le statut courant (string) depuis l'état actif.
   */
  getCurrentStatus(): string {
    return this.currentState.getStatus();
  }
}