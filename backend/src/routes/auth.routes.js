import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, profile, logoutHandler, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes."
  }
});

router.post("/register", authLimiter, requireFields(["name", "email", "password"]), register);
router.post("/login", authLimiter, requireFields(["email", "password"]), login);
router.post("/forgot-password", authLimiter, requireFields(["email"]), forgotPasswordHandler);
router.post("/reset-password/:token", authLimiter, requireFields(["password"]), resetPasswordHandler);

router.get("/profile", authenticate, profile);
router.post("/logout", logoutHandler);

export default router;
