import pool from "../config/db.js";

export async function createRecurring(data) {
  const {
    userId,
    categoryId = null,
    amount,
    type,
    description = null,
    frequency,
    intervalValue = 1,
    nextDate,
    endDate = null,
    active = 1
  } = data;

  const [result] = await pool.execute(
    `
    INSERT INTO recurring_transactions
    (user_id, category_id, amount, type, description, frequency, interval_value, next_date, end_date, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [userId, categoryId, amount, type, description, frequency, intervalValue, nextDate, endDate, active]
  );

  return result.insertId;
}

export async function findRecurringById(id, userId) {
  const [rows] = await pool.execute(
    `
    SELECT r.id, r.user_id, r.category_id, r.amount, r.type, r.description,
           r.frequency, r.interval_value, r.next_date, r.end_date, r.active,
           r.created_at, r.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM recurring_transactions r
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.id = ?
      AND r.user_id = ?
    LIMIT 1
    `,
    [id, userId]
  );

  return rows[0];
}

export async function listRecurring(userId) {
  const [rows] = await pool.execute(
    `
    SELECT r.id, r.user_id, r.category_id, r.amount, r.type, r.description,
           r.frequency, r.interval_value, r.next_date, r.end_date, r.active,
           r.created_at, r.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM recurring_transactions r
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.user_id = ?
    ORDER BY r.next_date ASC
    `,
    [userId]
  );

  return rows;
}

export async function updateRecurring(id, userId, updates) {
  const fields = [];
  const values = [];

  if (updates.amount !== undefined) {
    fields.push("amount = ?");
    values.push(updates.amount);
  }

  if (updates.categoryId !== undefined) {
    fields.push("category_id = ?");
    values.push(updates.categoryId);
  }

  if (updates.type !== undefined) {
    fields.push("type = ?");
    values.push(updates.type);
  }

  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }

  if (updates.frequency !== undefined) {
    fields.push("frequency = ?");
    values.push(updates.frequency);
  }

  if (updates.intervalValue !== undefined) {
    fields.push("interval_value = ?");
    values.push(updates.intervalValue);
  }

  if (updates.nextDate !== undefined) {
    fields.push("next_date = ?");
    values.push(updates.nextDate);
  }

  if (updates.endDate !== undefined) {
    fields.push("end_date = ?");
    values.push(updates.endDate);
  }

  if (updates.active !== undefined) {
    fields.push("active = ?");
    values.push(updates.active);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id, userId);

  const [result] = await pool.execute(
    `
    UPDATE recurring_transactions
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND user_id = ?
    `,
    values
  );

  return result.affectedRows;
}

export async function deleteRecurring(id, userId) {
  const [result] = await pool.execute(
    `
    DELETE FROM recurring_transactions
    WHERE id = ?
      AND user_id = ?
    `,
    [id, userId]
  );

  return result.affectedRows;
}

export async function findDueRecurring() {
  const [rows] = await pool.execute(
    `
    SELECT r.id, r.user_id, r.category_id, r.amount, r.type, r.description,
           r.frequency, r.interval_value, r.next_date, r.end_date, r.active,
           r.created_at, r.updated_at,
           c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM recurring_transactions r
    LEFT JOIN categories c ON c.id = r.category_id
    WHERE r.active = 1
      AND r.next_date <= CURDATE()
    ORDER BY r.user_id
    `
  );

  return rows;
}
