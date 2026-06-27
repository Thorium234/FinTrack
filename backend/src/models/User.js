import pool from "../config/db.js";

export async function createUser(userData) {
  const { name, email, passwordHash } = userData;

  const [result] = await pool.execute(
    `
    INSERT INTO users
    (name, email, password_hash)
    VALUES (?, ?, ?)
    `,
    [name, email, passwordHash]
  );

  return result.insertId;
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM users
    WHERE email = ?
    `,
    [email]
  );

  return rows[0];
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `
    SELECT id, name, email, created_at, updated_at
    FROM users
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
}

export async function setResetToken(userId, token, expiresAt) {
  await pool.execute(
    `
    UPDATE users
    SET reset_token = ?, reset_token_expires = ?
    WHERE id = ?
    `,
    [token, expiresAt, userId]
  );
}

export async function findUserByResetToken(token) {
  const [rows] = await pool.execute(
    `
    SELECT id, name, email
    FROM users
    WHERE reset_token = ?
      AND reset_token_expires > NOW()
    LIMIT 1
    `,
    [token]
  );

  return rows[0];
}

export async function updateUserPassword(userId, passwordHash) {
  await pool.execute(
    `
    UPDATE users
    SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [passwordHash, userId]
  );
}
