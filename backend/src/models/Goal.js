import pool from "../config/db.js";

export async function createGoal(goalData) {
  const { userId, name, targetAmount, currentAmount = 0, deadline = null, categoryId = null } = goalData;

  const [result] = await pool.execute(
    `
    INSERT INTO goals
    (user_id, name, target_amount, current_amount, deadline, category_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, name, targetAmount, currentAmount, deadline, categoryId]
  );

  return result.insertId;
}

export async function findGoalById(goalId, userId) {
  const [rows] = await pool.execute(
    `
    SELECT
      g.id,
      g.user_id,
      g.name,
      g.target_amount,
      g.current_amount,
      g.deadline,
      g.category_id,
      g.created_at,
      g.updated_at,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM goals g
    LEFT JOIN categories c ON c.id = g.category_id
    WHERE g.id = ?
      AND g.user_id = ?
    LIMIT 1
    `,
    [goalId, userId]
  );

  return rows[0];
}

export async function listGoals(userId) {
  const [rows] = await pool.execute(
    `
    SELECT
      g.id,
      g.user_id,
      g.name,
      g.target_amount,
      g.current_amount,
      g.deadline,
      g.category_id,
      g.created_at,
      g.updated_at,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM goals g
    LEFT JOIN categories c ON c.id = g.category_id
    WHERE g.user_id = ?
    ORDER BY g.deadline ASC, g.id ASC
    `,
    [userId]
  );

  return rows;
}

export async function updateGoal(goalId, userId, updates) {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.targetAmount !== undefined) {
    fields.push("target_amount = ?");
    values.push(updates.targetAmount);
  }

  if (updates.currentAmount !== undefined) {
    fields.push("current_amount = ?");
    values.push(updates.currentAmount);
  }

  if (updates.deadline !== undefined) {
    fields.push("deadline = ?");
    values.push(updates.deadline);
  }

  if (updates.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(updates.categoryId);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(goalId, userId);

  const [result] = await pool.execute(
    `
    UPDATE goals
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
    `,
    values
  );

  return result.affectedRows;
}

export async function deleteGoal(goalId, userId) {
  const [result] = await pool.execute(
    `
    DELETE FROM goals
    WHERE id = ?
      AND user_id = ?
    `,
    [goalId, userId]
  );

  return result.affectedRows;
}
