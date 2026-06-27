import {
  createTransaction,
  deleteTransaction,
  findTransactionById,
  getCategoryBreakdown,
  getRecentTransactions,
  getTransactionSummary,
  listTransactions,
  updateTransaction
} from "../models/Transaction.js";
import { findCategoryById } from "../models/Category.js";
import {
  createHttpError,
  normalizeOptionalText,
  parseDateString,
  parseMonth,
  parsePositiveNumber
} from "../utils/validation.js";

function validateTransactionPayload(payload) {
  const amount = parsePositiveNumber(payload.amount, "Amount");

  if (!["income", "expense"].includes(payload.type)) {
    throw createHttpError("Type must be income or expense", 400);
  }

  const transactionDate = parseDateString(
    payload.transactionDate || payload.date,
    "Transaction date"
  );

  return {
    amount,
    transactionDate
  };
}

async function resolveCategory(userId, categoryId) {
  if (categoryId === undefined || categoryId === null || categoryId === "") {
    return null;
  }

  const resolvedCategory = await findCategoryById(categoryId, userId);
  if (!resolvedCategory) {
    throw createHttpError("Category not found", 404);
  }

  return resolvedCategory;
}

export async function addTransaction(userId, payload) {
  const { amount, transactionDate } = validateTransactionPayload(payload);
  const category = await resolveCategory(userId, payload.categoryId);

  const transactionId = await createTransaction({
    userId,
    categoryId: category ? category.id : null,
    amount,
    type: payload.type,
    description: normalizeOptionalText(payload.description, "Description") ?? null,
    transactionDate,
    receiptUrl: normalizeOptionalText(payload.receiptUrl, "Receipt URL") ?? null
  });

  return findTransactionById(transactionId, userId);
}

export async function getTransactions(userId, filters = {}) {
  return listTransactions(userId, {
    type: filters.type,
    categoryId: filters.categoryId,
    month: filters.month ? parseMonth(filters.month) : undefined,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    limit: filters.limit,
    offset: filters.offset
  });
}

export async function getTransaction(userId, transactionId) {
  const transaction = await findTransactionById(transactionId, userId);
  if (!transaction) {
    throw createHttpError("Transaction not found", 404);
  }

  return transaction;
}

export async function editTransaction(userId, transactionId, payload) {
  const existingTransaction = await findTransactionById(transactionId, userId);
  if (!existingTransaction) {
    throw createHttpError("Transaction not found", 404);
  }

  const updates = {};

  if (payload.categoryId !== undefined) {
    const category = await resolveCategory(userId, payload.categoryId);
    updates.categoryId = category ? category.id : null;
  }

  if (payload.amount !== undefined) {
    updates.amount = parsePositiveNumber(payload.amount, "Amount");
  }

  if (payload.type !== undefined) {
    if (!["income", "expense"].includes(payload.type)) {
      throw createHttpError("Type must be income or expense", 400);
    }
    updates.type = payload.type;
  }

  if (payload.description !== undefined) {
    updates.description = normalizeOptionalText(payload.description, "Description") ?? null;
  }

  if (payload.transactionDate !== undefined) {
    updates.transactionDate = parseDateString(payload.transactionDate, "Transaction date");
  }

  if (payload.receiptUrl !== undefined) {
    updates.receiptUrl = normalizeOptionalText(payload.receiptUrl, "Receipt URL") ?? null;
  }

  const affectedRows = await updateTransaction(transactionId, userId, updates);
  if (!affectedRows) {
    throw createHttpError("Nothing to update", 400);
  }

  return findTransactionById(transactionId, userId);
}

export async function removeTransaction(userId, transactionId) {
  const existingTransaction = await findTransactionById(transactionId, userId);
  if (!existingTransaction) {
    throw createHttpError("Transaction not found", 404);
  }

  const affectedRows = await deleteTransaction(transactionId, userId);
  if (!affectedRows) {
    throw createHttpError("Transaction not found", 404);
  }

  return true;
}

export async function getTransactionDashboard(userId, month) {
  const resolvedMonth = parseMonth(month);

  const [summary, recentTransactions, categoryBreakdown] = await Promise.all([
    getTransactionSummary(userId, resolvedMonth),
    getRecentTransactions(userId, 5),
    getCategoryBreakdown(userId, resolvedMonth)
  ]);

  return {
    month: resolvedMonth,
    summary,
    recentTransactions,
    categoryBreakdown
  };
}
