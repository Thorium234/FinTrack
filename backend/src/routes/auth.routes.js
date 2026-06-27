/*import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/profile",
  authenticate,
  profile
);
export default router;
*/
import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireFields } from "../middlewares/validate.middleware.js";

const router = Router();

// Public routes
router.post("/register", requireFields(["name", "email", "password"]), register);
router.post("/login", requireFields(["email", "password"]), login);

// Protected route (Requires the token to access)
router.get("/profile", authenticate, profile);

export default router;
