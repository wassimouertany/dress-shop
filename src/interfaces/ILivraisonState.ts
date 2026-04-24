// src/interfaces/ILivraisonState.ts
import { LivraisonDocument } from '../models/Livraison';

export interface ILivraisonState {
  /**
   * Retourne la valeur string du statut que cet état représente.
   */
  getStatus(): string;

  /**
   * Vérifie si la transition vers `nextStatus` est légale depuis cet état.
   */
  canTransitionTo(nextStatus: string): boolean;

  /**
   * Applique la transition : met à jour le document livraison
   * (status + champs spécifiques à l'état, ex: deliveredAt).
   * Lève une Error si la transition n'est pas autorisée.
   */
  handle(livraison: LivraisonDocument, nextStatus: string): void;
}