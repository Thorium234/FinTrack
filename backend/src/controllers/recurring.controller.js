import {
  addRecurring,
  editRecurring,
  getUserRecurring,
  removeRecurring
} from "../services/recurring.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function listRecurring(req, res) {
  try {
    const recurringTransactions = await getUserRecurring(req.user.userId);
    return sendSuccess(res, 200, "Recurring transactions retrieved successfully", {
      recurringTransactions
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function createRecurring(req, res) {
  try {
    const recurringTransaction = await addRecurring(req.user.userId, req.body);
    return sendSuccess(res, 201, "Recurring transaction created successfully", {
      recurringTransaction
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function updateRecurringById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return sendError(res, 400, "Invalid recurring transaction id");
    }

    const recurringTransaction = await editRecurring(req.user.userId, id, req.body);
    return sendSuccess(res, 200, "Recurring transaction updated successfully", {
      recurringTransaction
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function deleteRecurringById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return sendError(res, 400, "Invalid recurring transaction id");
    }

    await removeRecurring(req.user.userId, id);
    return sendSuccess(res, 200, "Recurring transaction deleted successfully");
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
