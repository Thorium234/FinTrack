import { registerUser, loginUser, forgotPassword, resetPassword } from "../services/auth.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api",
  maxAge: 24 * 60 * 60 * 1000
};

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    const result = await registerUser({ name, email, password });
    res.cookie("token", result.token, COOKIE_OPTIONS);

    return sendSuccess(res, 201, "User created successfully", { user: result.user });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const result = await loginUser(email, password);
    res.cookie("token", result.token, COOKIE_OPTIONS);

    return sendSuccess(res, 200, "Login successful", { user: result.user });

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}

export async function profile(req, res) {
  try {
    return sendSuccess(res, 200, "Profile retrieved successfully", {
      user: req.user
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal server error");
  }
}

export async function logoutHandler(req, res) {
  res.clearCookie("token", { path: "/api" });
  return sendSuccess(res, 200, "Logged out successfully");
}

export async function forgotPasswordHandler(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    const result = await forgotPassword(email);
    return sendSuccess(res, 200, "Reset link sent if email exists", result);

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}

export async function resetPasswordHandler(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return sendError(res, 400, "Token and new password are required");
    }

    const result = await resetPassword(token, password);
    return sendSuccess(res, 200, "Password reset successfully", result);

  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}
