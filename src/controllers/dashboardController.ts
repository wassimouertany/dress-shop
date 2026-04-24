import { Request, Response } from 'express';
import { getDashboardStats } from '../services/dashboardService';

export const index = async (req: Request, res: Response) => {
  try {
    const data = await getDashboardStats();
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting dashboard' });
  }
};