import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  remove,
} from "../controllers/productController";
import { authorize, protect, uploadImage } from "../middleware";
import { productValidation, validate } from "../validation";
import { Role } from '../types';


const router = Router();

router
  .route("/")
  .get(index)
  .post(
    protect,              // ← 1. authentification d'abord
    authorize(Role.Admin),   // ← 2. vérification du rôle
    uploadImage,          // ← 3. upload seulement si ADMIN confirmé
    productValidation(),
    validate,
    store
  );

router
  .route("/:id")
  .get(show)
  .delete(protect, authorize(Role.Admin), remove)
  .patch(
    protect,             // ← même correction pour PATCH
    authorize(Role.Admin),
    uploadImage,
    update
  );

export { router as productRoutes };