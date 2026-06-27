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
