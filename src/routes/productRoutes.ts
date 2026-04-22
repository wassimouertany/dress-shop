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

const router = Router();

router
  .route("/")
  .get(index)
  .post(
    uploadImage,
    protect,
    authorize("ADMIN"),
    productValidation(),
    validate,
    store
  );

router
  .route("/:id")
  .get(show)
  .delete(protect, authorize("ADMIN"), remove)
  .patch(uploadImage, protect, authorize("ADMIN"), update);

export { router as productRoutes };
