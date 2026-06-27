import {
  createBudget,
  deleteBudget,
  findBudgetByCategoryAndMonth,
  findBudgetById,
  getBudgetUsage,
  listBudgets,
  updateBudget
} from "../models/Budget.js";
import { findCategoryById } from "../models/Category.js";
import {
  createHttpError,
  parseMonth,
  parsePositiveNumber
} from "../utils/validation.js";

async function resolveCategory(userId, categoryId) {
  const category = await findCategoryById(categoryId, userId);
  if (!category) {
    throw createHttpError("Category not found", 404);
  }

  return category;
}

export async function addBudget(userId, payload) {
  const amount = parsePositiveNumber(payload.amount, "Amount");

  if (!payload.categoryId) {
    throw createHttpError("Category is required", 400);
  }

  const month = parseMonth(payload.month);
  const category = await resolveCategory(userId, payload.categoryId);
  const existingBudget = await findBudgetByCategoryAndMonth(userId, category.id, month);
  if (existingBudget) {
    throw createHttpError("Budget already exists for this category and month", 409);
  }

  const budgetId = await createBudget({
    userId,
    categoryId: category.id,
    amount,
    month
  });

  return findBudgetById(budgetId, userId);
}

export async function getBudgets(userId, month) {
  const resolvedMonth = parseMonth(month);
  return listBudgets(userId, resolvedMonth);
}

export async function editBudget(userId, budgetId, payload) {
  const existingBudget = await findBudgetById(budgetId, userId);
  if (!existingBudget) {
    throw createHttpError("Budget not found", 404);
  }

  const updates = {};

  if (payload.categoryId !== undefined) {
    const category = await resolveCategory(userId, payload.categoryId);
    updates.categoryId = category.id;
  }

  if (payload.amount !== undefined) {
    updates.amount = parsePositiveNumber(payload.amount, "Amount");
  }

  if (payload.month !== undefined) {
    updates.month = parseMonth(payload.month);
  }

  const targetCategoryId = updates.categoryId ?? existingBudget.category_id;
  const targetMonth = updates.month ?? existingBudget.month;
  const duplicateBudget = await findBudgetByCategoryAndMonth(
    userId,
    targetCategoryId,
    targetMonth,
    budgetId
  );

  if (duplicateBudget) {
    throw createHttpError("Budget already exists for this category and month", 409);
  }

  const affectedRows = await updateBudget(budgetId, userId, updates);
  if (!affectedRows) {
    throw createHttpError("Nothing to update", 400);
  }

  return findBudgetById(budgetId, userId);
}

export async function removeBudget(userId, budgetId) {
  const existingBudget = await findBudgetById(budgetId, userId);
  if (!existingBudget) {
    throw createHttpError("Budget not found", 404);
  }

  const affectedRows = await deleteBudget(budgetId, userId);
  if (!affectedRows) {
    throw createHttpError("Budget not found", 404);
  }

  return true;
}

export async function getBudgetDashboard(userId, month) {
  const resolvedMonth = parseMonth(month);
  const [budgets, usage] = await Promise.all([
    listBudgets(userId, resolvedMonth),
    getBudgetUsage(userId, resolvedMonth)
  ]);

  return {
    month: resolvedMonth,
    budgets,
    usage
  };
}
