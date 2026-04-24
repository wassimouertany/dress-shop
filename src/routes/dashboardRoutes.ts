import { Router } from "express";
import { protect, authorize } from "../middleware";
import { index } from "../controllers/dashboardController";
import { Role } from '../types';


const router = Router();

router.route("/").get(protect, authorize(Role.Admin), index);

export { router as dashboardRoutes };
