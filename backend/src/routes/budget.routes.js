import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import {
  budgetSummary,
  createBudget,
  deleteBudgetById,
  getBudgetById,
  listBudgets,
  updateBudgetById
} from "../controllers/budget.controller.js";

const router = Router();

router.use(authenticate);

router.get("/summary", budgetSummary);
router.get("/", listBudgets);
router.post("/", requireFields(["categoryId", "amount", "month"]), createBudget);
router.get("/:id", getBudgetById);
router.put("/:id", updateBudgetById);
router.delete("/:id", deleteBudgetById);

export default router;
