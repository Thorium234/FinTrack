import fs from "fs";
import { parse } from "csv-parse/sync";
import { createTransaction } from "../models/Transaction.js";
import { listCategories } from "../models/Category.js";

const REQUIRED_COLUMNS = ["date", "amount", "type"];
const VALID_TYPES = new Set(["income", "expense"]);

function normalizeHeader(header) {
  const map = {
    date: "date",
    amount: "amount",
    type: "type",
    category: "category",
    category_name: "category",
    categoryname: "category",
    description: "description",
    desc: "description"
  };
  return map[header.trim().toLowerCase()] || null;
}

export async function importCsv(userId, filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });

  const errors = [];
  const validRows = [];
  const categories = await listCategories(userId);
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.name.toLowerCase()] = c.id;
  });

  records.forEach((rawRow, index) => {
    const row = {};
    const rowNum = index + 2;

    for (const key of Object.keys(rawRow)) {
      const normalized = normalizeHeader(key);
      if (normalized) {
        row[normalized] = rawRow[key];
      }
    }

    const missing = REQUIRED_COLUMNS.filter((col) => !row[col]);
    if (missing.length) {
      errors.push({ row: rowNum, error: `Missing columns: ${missing.join(", ")}` });
      return;
    }

    const type = row.type.toLowerCase();
    if (!VALID_TYPES.has(type)) {
      errors.push({ row: rowNum, error: `Invalid type "${row.type}". Must be income or expense.` });
      return;
    }

    const amount = parseFloat(row.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({ row: rowNum, error: `Invalid amount "${row.amount}". Must be a positive number.` });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row.date)) {
      errors.push({ row: rowNum, error: `Invalid date "${row.date}". Use YYYY-MM-DD format.` });
      return;
    }

    let categoryId = null;
    if (row.category) {
      const key = row.category.trim().toLowerCase();
      categoryId = categoryMap[key] || null;
      if (!categoryId) {
        errors.push({ row: rowNum, error: `Category "${row.category}" not found. Available: ${Object.keys(categoryMap).join(", ")}` });
        return;
      }
    }

    validRows.push({
      userId,
      categoryId,
      amount,
      type,
      description: row.description || null,
      transactionDate: row.date
    });
  });

  if (errors.length && validRows.length === 0) {
    fs.unlinkSync(filePath);
    const error = new Error("CSV contains no valid rows");
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }

  const imported = [];
  const importErrors = [];

  for (const row of validRows) {
    try {
      const id = await createTransaction(row);
      imported.push(id);
    } catch (err) {
      importErrors.push({ row: "validated", error: err.message });
    }
  }

  fs.unlinkSync(filePath);

  return {
    total: records.length,
    imported: imported.length,
    errors: [...errors, ...importErrors],
    errorCount: errors.length + importErrors.length
  };
}
