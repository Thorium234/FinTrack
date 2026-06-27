import { importCsv } from "../services/csvImport.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function csvImport(req, res) {
  try {
    if (!req.file) {
      return sendError(res, 400, "CSV file is required");
    }

    const result = await importCsv(req.user.userId, req.file.path);
    return sendSuccess(res, 200, "CSV import completed", result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error", error.details);
  }
}
