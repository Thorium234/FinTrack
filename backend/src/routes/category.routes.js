import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import {
  createCategory,
  deleteCategoryById,
  getCategory,
  listCategories,
  updateCategoryById
} from "../controllers/category.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listCategories);
router.post("/", requireFields(["name"]), createCategory);
router.get("/:id", getCategory);
router.put("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);

export default router;
