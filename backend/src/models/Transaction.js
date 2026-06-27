import pool from "../config/db.js";

export async function createTransaction(transactionData) {
  const {
    userId,
    categoryId = null,
    amount,
    type,
    description = null,
    transactionDate,
    receiptUrl = null
  } = transactionData;

  const [result] = await pool.execute(
    `
    INSERT INTO transactions
    (user_id, category_id, amount, type, description, transaction_date, receipt_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [userId, categoryId, amount, type, description, transactionDate, receiptUrl]
  );

  return result.insertId;
}

export async function findTransactionById(transactionId, userId) {
  const [rows] = await pool.execute(
    `
    SELECT t.id, t.user_id, t.category_id, t.amount, t.type, t.description,
           t.transaction_date, t.receipt_url, t.created_at, t.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.id = ?
      AND t.user_id = ?
    LIMIT 1
    `,
    [transactionId, userId]
  );

  return rows[0];
}

export async function listTransactions(userId, filters = {}) {
  const conditions = ["t.user_id = ?"];
  const values = [userId];

  if (filters.type) {
    conditions.push("t.type = ?");
    values.push(filters.type);
  }

  if (filters.categoryId) {
    conditions.push("t.category_id = ?");
    values.push(filters.categoryId);
  }

  if (filters.month) {
    conditions.push("DATE_FORMAT(t.transaction_date, '%Y-%m') = ?");
    values.push(filters.month);
  }

  if (filters.fromDate) {
    conditions.push("t.transaction_date >= ?");
    values.push(filters.fromDate);
  }

  if (filters.toDate) {
    conditions.push("t.transaction_date <= ?");
    values.push(filters.toDate);
  }

  const limit = Number.isFinite(Number(filters.limit)) ? Number(filters.limit) : 50;
  const offset = Number.isFinite(Number(filters.offset)) ? Number(filters.offset) : 0;

  values.push(limit, offset);

  const [rows] = await pool.execute(
    `
    SELECT t.id, t.user_id, t.category_id, t.amount, t.type, t.description,
           t.transaction_date, t.receipt_url, t.created_at, t.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT ? OFFSET ?
    `,
    values
  );

  return rows;
}

export async function updateTransaction(transactionId, userId, updates) {
  const fields = [];
  const values = [];

  if (updates.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(updates.categoryId);
  }

  if (updates.amount !== undefined) {
    fields.push("amount = ?");
    values.push(updates.amount);
  }

  if (updates.type !== undefined) {
    fields.push("type = ?");
    values.push(updates.type);
  }

  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }

  if (updates.transactionDate !== undefined) {
    fields.push("transaction_date = ?");
    values.push(updates.transactionDate);
  }

  if (updates.receiptUrl !== undefined) {
    fields.push("receipt_url = ?");
    values.push(updates.receiptUrl);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(transactionId, userId);

  const [result] = await pool.execute(
    `
    UPDATE transactions
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
    `,
    values
  );

  return result.affectedRows;
}

export async function deleteTransaction(transactionId, userId) {
  const [result] = await pool.execute(
    `
    DELETE FROM transactions
    WHERE id = ?
      AND user_id = ?
    `,
    [transactionId, userId]
  );

  return result.affectedRows;
}

export async function getTransactionSummary(userId, month) {
  const [rows] = await pool.execute(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions
    WHERE user_id = ?
      AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
    `,
    [userId, month]
  );

  return rows[0];
}

export async function getRecentTransactions(userId, limit = 5) {
  const [rows] = await pool.execute(
    `
    SELECT t.id, t.user_id, t.category_id, t.amount, t.type, t.description,
           t.transaction_date, t.receipt_url, t.created_at, t.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT ?
    `,
    [userId, limit]
  );

  return rows;
}

export async function getCategoryBreakdown(userId, month) {
  const [rows] = await pool.execute(
    `
    SELECT
      t.category_id,
      COALESCE(c.name, 'Uncategorized') AS category_name,
      COALESCE(c.color, '#64748b') AS category_color,
      COALESCE(c.icon, 'tag') AS category_icon,
      SUM(t.amount) AS total
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
      AND t.type = 'expense'
      AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
    GROUP BY t.category_id, c.name, c.color, c.icon
    ORDER BY total DESC
    `,
    [userId, month]
  );

  return rows;
}

export async function getYearlySummary(userId, year) {
  const [rows] = await pool.execute(
    `
    SELECT
      DATE_FORMAT(transaction_date, '%Y-%m') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions
    WHERE user_id = ?
      AND YEAR(transaction_date) = ?
    GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
    ORDER BY month ASC
    `,
    [userId, year]
  );

  return rows;
}

export async function getYearlyCategoryBreakdown(userId, year) {
  const [rows] = await pool.execute(
    `
    SELECT
      t.category_id,
      COALESCE(c.name, 'Uncategorized') AS category_name,
      COALESCE(c.color, '#64748b') AS category_color,
      COALESCE(c.icon, 'tag') AS category_icon,
      SUM(t.amount) AS total
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = ?
      AND t.type = 'expense'
      AND YEAR(t.transaction_date) = ?
    GROUP BY t.category_id, c.name, c.color, c.icon
    ORDER BY total DESC
    `,
    [userId, year]
  );

  return rows;
}

export async function getYearComparison(userId, years) {
  const placeholders = years.map(() => "?").join(", ");
  const [rows] = await pool.execute(
    `
    SELECT
      YEAR(transaction_date) AS year,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions
    WHERE user_id = ?
      AND YEAR(transaction_date) IN (${placeholders})
    GROUP BY YEAR(transaction_date)
    ORDER BY year ASC
    `,
    [userId, ...years]
  );

  return rows;
}
