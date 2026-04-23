import { LivraisonDocument } from '../models/Livraison';

export interface ILivraisonService {
  getLivraisonByOrder(
    userId:  string,
    orderId: string
  ): Promise<LivraisonDocument>;

  updateLivraisonStatus(
    userId:      string,
    livraisonId: string,
    status:      string
  ): Promise<LivraisonDocument>;
}