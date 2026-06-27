import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { listUsers, getUserData } from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/users", listUsers);
router.get("/users/:id", getUserData);

export default router;
