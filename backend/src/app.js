import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLog.middleware.js";

const app = express();
const uploadsDir = fileURLToPath(new URL("../uploads", import.meta.url));

// 1. MIDDLEWARES (Must run first)
app.use(cors());
app.use(express.json()); // <-- This extracts JSON and creates req.body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(requestLogger);
app.use("/uploads", express.static(path.resolve(uploadsDir)));

// 2. ROUTES (Must run second)
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Base health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinTrack API Running"
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
