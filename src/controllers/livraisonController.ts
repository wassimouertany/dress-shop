import { Request, Response }  from 'express';
import { IdentifiableUser }   from '../types';
import { ILivraisonService }  from '../interfaces/ILivraisonService';

const mapLivraisonError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  if (error.message === 'Not allowed') {
    res.status(403).json({ message: 'Not allowed' });
    return true;
  }
  if (error.message === 'Invalid status') {
    res.status(400).json({
      message: 'Invalid status; use SHIPPED, IN_TRANSIT, or DELIVERED',
    });
    return true;
  }
  if (error.message.toLowerCase().includes('not found')) {
    res.status(404).json({ message: error.message });
    return true;
  }

  return false;
};

export class LivraisonController {

  private readonly livraisonService: ILivraisonService;

  constructor(livraisonService: ILivraisonService) {
    this.livraisonService = livraisonService;
  }

  getByOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const user        = req.user as IdentifiableUser;
      const { orderId } = req.params;

      const livraison = await this.livraisonService.getLivraisonByOrder(
        String(user._id),
        orderId
      );

      res.status(200).json({ data: livraison, success: true });
    } catch (error) {
      if (mapLivraisonError(res, error)) return;
      res.status(500).json({ message: 'Error fetching livraison' });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const user       = req.user as IdentifiableUser;
      const { id }     = req.params;
      const { status } = req.body as { status?: string };

      const updated = await this.livraisonService.updateLivraisonStatus(
        String(user._id),
        id,
        status ?? ''
      );

      res.status(200).json({ data: updated, success: true });
    } catch (error) {
      if (mapLivraisonError(res, error)) return;
      res.status(500).json({ message: 'Error updating livraison' });
    }
  };
}