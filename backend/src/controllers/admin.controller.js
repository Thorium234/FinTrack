import pool from "../config/db.js";
import { listAllUsers, findUserById } from "../models/User.js";
import { sendSuccess } from "../utils/response.js";

export async function listUsers(req, res, next) {
  try {
    const users = await listAllUsers();

    return sendSuccess(res, 200, "Users retrieved successfully", { users });
  } catch (error) {
    next(error);
  }
}

export async function getUserData(req, res, next) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [transactions] = await pool.execute(
      `
      SELECT t.id, t.user_id, t.category_id, t.amount, t.type, t.description,
             t.transaction_date, t.receipt_url, t.created_at, t.updated_at,
             c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
      `,
      [userId]
    );

    const [budgets] = await pool.execute(
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
        GROUP BY category_id
      ) spent ON spent.category_id = b.category_id
      WHERE b.user_id = ?
      ORDER BY b.month DESC, c.name ASC
      `,
      [userId, userId]
    );

    const [goals] = await pool.execute(
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

    return sendSuccess(res, 200, "User data retrieved successfully", {
      user,
      transactions,
      budgets,
      goals
    });
  } catch (error) {
    next(error);
  }
}
