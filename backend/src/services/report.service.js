import { getYearlySummary, getYearlyCategoryBreakdown, getYearComparison as getYearComparisonModel } from "../models/Transaction.js";

export async function getYearlyReport(userId, year) {
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
    const error = new Error("Invalid year");
    error.statusCode = 400;
    throw error;
  }

  const [monthlySummary, categoryBreakdown] = await Promise.all([
    getYearlySummary(userId, yearNum),
    getYearlyCategoryBreakdown(userId, yearNum)
  ]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    const key = `${yearNum}-${m}`;
    const found = monthlySummary.find((row) => row.month === key);
    return {
      month: key,
      total_income: found ? parseFloat(found.total_income) : 0,
      total_expense: found ? parseFloat(found.total_expense) : 0,
      balance: found ? parseFloat(found.balance) : 0
    };
  });

  const totals = months.reduce(
    (acc, m) => ({
      total_income: acc.total_income + m.total_income,
      total_expense: acc.total_expense + m.total_expense,
      balance: acc.balance + m.balance
    }),
    { total_income: 0, total_expense: 0, balance: 0 }
  );

  return {
    year: yearNum,
    months,
    totals,
    categoryBreakdown: categoryBreakdown.map((c) => ({
      ...c,
      total: parseFloat(c.total)
    }))
  };
}

export async function getYearComparison(userId, yearsParam) {
  const years = String(yearsParam)
    .split(",")
    .map((y) => parseInt(y.trim(), 10))
    .filter((y) => !isNaN(y) && y >= 2000 && y <= 2100);

  if (years.length < 2) {
    const error = new Error("Provide at least 2 years for comparison (e.g. ?years=2025,2026)");
    error.statusCode = 400;
    throw error;
  }

  const rows = await getYearComparisonModel(userId, years);
  return rows.map((r) => ({
    year: r.year,
    total_income: parseFloat(r.total_income),
    total_expense: parseFloat(r.total_expense),
    balance: parseFloat(r.balance)
  }));
}
