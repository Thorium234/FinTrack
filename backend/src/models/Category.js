import pool from "../config/db.js";

export async function createCategory(categoryData) {
  const { userId, name, color = null, icon = null, isGlobal = 0 } = categoryData;

  const [result] = await pool.execute(
    `
    INSERT INTO categories
    (user_id, name, color, icon, is_global)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId, name, color, icon, isGlobal]
  );

  return result.insertId;
}

export async function findCategoryById(categoryId, userId) {
  const [rows] = await pool.execute(
    `
    SELECT id, user_id, name, color, icon, is_global, created_at, updated_at
    FROM categories
    WHERE id = ?
      AND (user_id = ? OR is_global = 1)
    LIMIT 1
    `,
    [categoryId, userId]
  );

  return rows[0];
}

export async function findCategoryByName(name, userId) {
  const [rows] = await pool.execute(
    `
    SELECT id, user_id, name, color, icon, is_global, created_at, updated_at
    FROM categories
    WHERE LOWER(name) = LOWER(?)
      AND (user_id = ? OR is_global = 1)
    LIMIT 1
    `,
    [name, userId]
  );

  return rows[0];
}

export async function listCategories(userId) {
  const [rows] = await pool.execute(
    `
    SELECT id, user_id, name, color, icon, is_global, created_at, updated_at
    FROM categories
    WHERE is_global = 1 OR user_id = ?
    ORDER BY is_global DESC, name ASC
    `,
    [userId]
  );

  return rows;
}

export async function updateCategory(categoryId, userId, updates) {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.color !== undefined) {
    fields.push("color = ?");
    values.push(updates.color);
  }

  if (updates.icon !== undefined) {
    fields.push("icon = ?");
    values.push(updates.icon);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(categoryId, userId);

  const [result] = await pool.execute(
    `
    UPDATE categories
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
    `,
    values
  );

  return result.affectedRows;
}

export async function deleteCategory(categoryId, userId) {
  const [result] = await pool.execute(
    `
    DELETE FROM categories
    WHERE id = ?
      AND user_id = ?
    `,
    [categoryId, userId]
  );

  return result.affectedRows;
}
