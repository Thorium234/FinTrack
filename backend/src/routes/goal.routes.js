import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import {
  createGoal,
  deleteGoalById,
  listGoals,
  updateGoalById
} from "../controllers/goal.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listGoals);
router.post("/", requireFields(["name", "targetAmount"]), createGoal);
router.put("/:id", updateGoalById);
router.delete("/:id", deleteGoalById);

export default router;
