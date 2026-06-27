import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, findUserById } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import {
  createHttpError,
  normalizePassword,
  normalizeRequiredText
} from "../utils/validation.js";

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
    email: user.email
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

  // Generate the JWT payload token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token // <-- Add token here
  };
}
