import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, createUser, findUserById, setResetToken, findUserByResetToken, updateUserPassword } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import {
  createHttpError,
  normalizePassword,
  normalizeRequiredText
} from "../utils/validation.js";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeRequiredText(email, "Email").toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(normalizePassword(password), 10);
  const userId = await createUser({
    name: normalizeRequiredText(name, "Name"),
    email: normalizedEmail,
    passwordHash
  });
  const user = await findUserById(userId);
  const token = generateToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.is_admin
  });

  return {
    user,
    token
  };
}

export async function loginUser(email, password) {
  const normalizedEmail = normalizeRequiredText(email, "Email").toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(normalizePassword(password), user.password_hash);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.is_admin
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin
    },
    token
  };
}

export async function forgotPassword(email) {
  const normalizedEmail = normalizeRequiredText(email, "Email").toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return { message: "If that email is registered, a reset link has been sent." };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString().slice(0, 19).replace("T", " ");

  await setResetToken(user.id, resetToken, expiresAt);

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/#/reset-password/${resetToken}`;
  console.log("============================================");
  console.log("PASSWORD RESET LINK (simulated email):");
  console.log(resetUrl);
  console.log("============================================");

  return { message: "If that email is registered, a reset link has been sent." };
}

export async function resetPassword(token, newPassword) {
  const user = await findUserByResetToken(token);
  if (!user) {
    throw createHttpError("Invalid or expired reset token", 400);
  }

  const passwordHash = await bcrypt.hash(normalizePassword(newPassword), 10);
  await updateUserPassword(user.id, passwordHash);

  return { message: "Password reset successfully" };
}
