import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";
import { uploadReceiptSingle } from "../middlewares/upload.middleware.js";
import { uploadCsvSingle } from "../middlewares/csvUpload.middleware.js";
import {
  createTransaction,
  dashboardSummary,
  deleteTransactionById,
  getTransactionById,
  listTransactions,
  updateTransactionById
} from "../controllers/transaction.controller.js";
import { csvImport } from "../controllers/csvImport.controller.js";

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
router.post("/import", uploadCsvSingle, csvImport);
router.get("/:id", getTransactionById);
router.put("/:id", uploadReceiptSingle, updateTransactionById);
router.delete("/:id", deleteTransactionById);

export default router;
