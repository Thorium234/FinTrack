import { getBudgetUsage } from "../models/Budget.js";
import {
  getCategoryBreakdown,
  getRecentTransactions,
  getTransactionSummary
} from "../models/Transaction.js";
import { listCategories } from "../models/Category.js";
import { parseMonth } from "../utils/validation.js";

export async function getDashboardSummary(userId, month) {
  const resolvedMonth = parseMonth(month);

  const [
    summary,
    recentTransactions,
    categoryBreakdown,
    budgets,
    categories
  ] = await Promise.all([
    getTransactionSummary(userId, resolvedMonth),
    getRecentTransactions(userId, 5),
    getCategoryBreakdown(userId, resolvedMonth),
    getBudgetUsage(userId, resolvedMonth),
    listCategories(userId)
  ]);

  return {
    month: resolvedMonth,
    summary,
    recentTransactions,
    categoryBreakdown,
    budgets,
    categories
  };
}
