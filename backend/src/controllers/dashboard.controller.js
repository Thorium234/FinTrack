import { getDashboardSummary } from "../services/dashboard.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function summary(req, res) {
  try {
    const data = await getDashboardSummary(req.user.userId, req.query.month);
    return sendSuccess(res, 200, "Dashboard summary retrieved successfully", data);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
