import {
  addBudget,
  editBudget,
  getBudgetDashboard,
  getBudgets,
  removeBudget
} from "../services/budget.service.js";
import { findBudgetById } from "../models/Budget.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function listBudgets(req, res) {
  try {
    const budgets = await getBudgets(req.user.userId, req.query.month);
    return sendSuccess(res, 200, "Budgets retrieved successfully", {
      budgets
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function createBudget(req, res) {
  try {
    const budget = await addBudget(req.user.userId, req.body);
    return sendSuccess(res, 201, "Budget created successfully", {
      budget
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function getBudgetById(req, res) {
  try {
    const budgetId = Number(req.params.id);
    if (!Number.isInteger(budgetId)) {
      return sendError(res, 400, "Invalid budget id");
    }

    const budget = await findBudgetById(budgetId, req.user.userId);
    if (!budget) {
      return sendError(res, 404, "Budget not found");
    }

    return sendSuccess(res, 200, "Budget retrieved successfully", {
      budget
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function updateBudgetById(req, res) {
  try {
    const budgetId = Number(req.params.id);
    if (!Number.isInteger(budgetId)) {
      return sendError(res, 400, "Invalid budget id");
    }

    const budget = await editBudget(req.user.userId, budgetId, req.body);
    return sendSuccess(res, 200, "Budget updated successfully", {
      budget
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function deleteBudgetById(req, res) {
  try {
    const budgetId = Number(req.params.id);
    if (!Number.isInteger(budgetId)) {
      return sendError(res, 400, "Invalid budget id");
    }

    await removeBudget(req.user.userId, budgetId);
    return sendSuccess(res, 200, "Budget deleted successfully");
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function budgetSummary(req, res) {
  try {
    const summary = await getBudgetDashboard(req.user.userId, req.query.month);
    return sendSuccess(res, 200, "Budget summary retrieved successfully", summary);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
