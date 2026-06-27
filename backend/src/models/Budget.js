import pool from "../config/db.js";

export async function createBudget(budgetData) {
  const { userId, categoryId, amount, month } = budgetData;

  const [result] = await pool.execute(
    `
    INSERT INTO budgets
    (user_id, category_id, amount, month)
    VALUES (?, ?, ?, ?)
    `,
    [userId, categoryId, amount, month]
  );

  return result.insertId;
}

export async function findBudgetById(budgetId, userId) {
  const [rows] = await pool.execute(
    `
    SELECT id, user_id, category_id, amount, month, created_at, updated_at
    FROM budgets
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [budgetId, userId]
  );

  return rows[0];
}

export async function findBudgetByCategoryAndMonth(userId, categoryId, month, excludeBudgetId = null) {
  const params = [userId, categoryId, month];
  let excludeClause = "";

  if (excludeBudgetId !== null) {
    excludeClause = "AND id <> ?";
    params.push(excludeBudgetId);
  }

  const [rows] = await pool.execute(
    `
    SELECT id, user_id, category_id, amount, month, created_at, updated_at
    FROM budgets
    WHERE user_id = ?
      AND category_id = ?
      AND month = ?
      ${excludeClause}
    LIMIT 1
    `,
    params
  );

  return rows[0];
}

export async function listBudgets(userId, month) {
  const [rows] = await pool.execute(
    `
    SELECT
      b.id,
      b.user_id,
      b.category_id,
      b.amount,
      b.month,
      b.created_at,
      b.updated_at,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon,
      COALESCE(spent.spent, 0) AS spent
    FROM budgets b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN (
      SELECT category_id, SUM(amount) AS spent
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
      GROUP BY category_id
    ) spent ON spent.category_id = b.category_id
    WHERE b.user_id = ?
      AND b.month = ?
    ORDER BY c.name ASC
    `,
    [userId, month, userId, month]
  );

  return rows;
}

export async function updateBudget(budgetId, userId, updates) {
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

  if (updates.month !== undefined) {
    fields.push("month = ?");
    values.push(updates.month);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(budgetId, userId);

  const [result] = await pool.execute(
    `
    UPDATE budgets
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
    `,
    values
  );

  return result.affectedRows;
}

export async function deleteBudget(budgetId, userId) {
  const [result] = await pool.execute(
    `
    DELETE FROM budgets
    WHERE id = ?
      AND user_id = ?
    `,
    [budgetId, userId]
  );

  return result.affectedRows;
}

export async function getBudgetUsage(userId, month) {
  const [rows] = await pool.execute(
    `
    SELECT
      b.id,
      b.category_id,
      b.amount,
      b.month,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon,
      COALESCE(spent.spent, 0) AS spent,
      GREATEST(b.amount - COALESCE(spent.spent, 0), 0) AS remaining
    FROM budgets b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN (
      SELECT category_id, SUM(amount) AS spent
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
      GROUP BY category_id
    ) spent ON spent.category_id = b.category_id
    WHERE b.user_id = ?
      AND b.month = ?
    ORDER BY c.name ASC
    `,
    [userId, month, userId, month]
  );

  return rows;
}
