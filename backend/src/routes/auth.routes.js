import { Router } from "express";
import { register, login, profile, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/register", requireFields(["name", "email", "password"]), register);
router.post("/login", requireFields(["email", "password"]), login);
router.post("/forgot-password", requireFields(["email"]), forgotPasswordHandler);
router.post("/reset-password/:token", requireFields(["password"]), resetPasswordHandler);

router.get("/profile", authenticate, profile);

export default router;
