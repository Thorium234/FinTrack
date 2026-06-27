import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { yearlyReport, yearComparison } from "../controllers/report.controller.js";

const router = Router();

router.use(authenticate);

router.get("/yearly", yearlyReport);
router.get("/yoy", yearComparison);

export default router;
