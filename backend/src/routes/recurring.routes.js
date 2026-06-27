import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import {
  createRecurring,
  deleteRecurringById,
  listRecurring,
  updateRecurringById
} from "../controllers/recurring.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listRecurring);
router.post("/", requireFields(["amount", "type", "next_date", "frequency"]), createRecurring);
router.put("/:id", updateRecurringById);
router.delete("/:id", deleteRecurringById);

export default router;
