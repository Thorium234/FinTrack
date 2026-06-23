import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// 1. MIDDLEWARES (Must run first)
app.use(cors());
app.use(express.json()); // <-- This extracts JSON and creates req.body
app.use(morgan("dev"));

// 2. ROUTES (Must run second)
app.use("/api/auth", authRoutes);

// Base health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinTrack API Running"
  });
});

export default app;

