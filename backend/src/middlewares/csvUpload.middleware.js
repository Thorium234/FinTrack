import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createHttpError } from "../utils/validation.js";

const csvDir = fileURLToPath(
  new URL("../../uploads/csv/", import.meta.url)
);

fs.mkdirSync(csvDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, csvDir);
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `import-${suffix}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  const allowed = new Set([
    "text/csv",
    "application/csv",
    "text/comma-separated-values",
    "application/vnd.ms-excel"
  ]);

  if (!allowed.has(file.mimetype) && !file.originalname.endsWith(".csv")) {
    callback(createHttpError("Only CSV files are allowed", 400));
    return;
  }

  callback(null, true);
}

const uploadCsv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadCsvSingle = uploadCsv.single("csv");
