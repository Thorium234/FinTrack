import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createHttpError } from "../utils/validation.js";

const receiptsDir = fileURLToPath(
  new URL("../../uploads/receipts/", import.meta.url)
);

fs.mkdirSync(receiptsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, receiptsDir);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `receipt-${suffix}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(createHttpError("Only JPG, PNG, WEBP, and PDF receipts are allowed", 400));
    return;
  }

  callback(null, true);
}

export const uploadReceipt = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadReceiptSingle = uploadReceipt.single("receipt");

export function buildReceiptUrl(filename) {
  return `/uploads/receipts/${filename}`;
}
