import {
  addTransaction,
  editTransaction,
  getTransaction,
  getTransactions,
  removeTransaction,
  getTransactionDashboard
} from "../services/transaction.service.js";
import { buildReceiptUrl } from "../middlewares/upload.middleware.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function listTransactions(req, res) {
  try {
    const transactions = await getTransactions(req.user.userId, req.query);
    return sendSuccess(res, 200, "Transactions retrieved successfully", {
      transactions
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function getTransactionById(req, res) {
  try {
    const transactionId = Number(req.params.id);
    if (!Number.isInteger(transactionId)) {
      return sendError(res, 400, "Invalid transaction id");
    }

    const transaction = await getTransaction(req.user.userId, transactionId);
    return sendSuccess(res, 200, "Transaction retrieved successfully", {
      transaction
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function createTransaction(req, res) {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.receiptUrl = buildReceiptUrl(req.file.filename);
    }

    const transaction = await addTransaction(req.user.userId, payload);
    return sendSuccess(res, 201, "Transaction created successfully", {
      transaction
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function updateTransactionById(req, res) {
  try {
    const transactionId = Number(req.params.id);
    if (!Number.isInteger(transactionId)) {
      return sendError(res, 400, "Invalid transaction id");
    }

    const payload = { ...req.body };
    if (req.file) {
      payload.receiptUrl = buildReceiptUrl(req.file.filename);
    }

    const transaction = await editTransaction(req.user.userId, transactionId, payload);
    return sendSuccess(res, 200, "Transaction updated successfully", {
      transaction
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function deleteTransactionById(req, res) {
  try {
    const transactionId = Number(req.params.id);
    if (!Number.isInteger(transactionId)) {
      return sendError(res, 400, "Invalid transaction id");
    }

    await removeTransaction(req.user.userId, transactionId);
    return sendSuccess(res, 200, "Transaction deleted successfully");
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function dashboardSummary(req, res) {
  try {
    const summary = await getTransactionDashboard(req.user.userId, req.query.month);
    return sendSuccess(res, 200, "Transaction summary retrieved successfully", summary);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
