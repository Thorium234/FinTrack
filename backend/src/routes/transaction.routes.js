import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import { uploadReceiptSingle } from "../middlewares/upload.middleware.js";
import {
  createTransaction,
  dashboardSummary,
  deleteTransactionById,
  getTransactionById,
  listTransactions,
  updateTransactionById
} from "../controllers/transaction.controller.js";

const router = Router();

router.use(authenticate);

router.get("/summary", dashboardSummary);
router.get("/", listTransactions);
router.post(
  "/",
  uploadReceiptSingle,
  requireFields(["amount", "type", "transactionDate"]),
  createTransaction
);
router.get("/:id", getTransactionById);
router.put("/:id", uploadReceiptSingle, updateTransactionById);
router.delete("/:id", deleteTransactionById);

export default router;
