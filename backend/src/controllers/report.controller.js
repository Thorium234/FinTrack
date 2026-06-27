import { getYearlyReport, getYearComparison } from "../services/report.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function yearlyReport(req, res) {
  try {
    const { year } = req.query;
    if (!year) {
      return sendError(res, 400, "Year query parameter is required (e.g. ?year=2026)");
    }

    const data = await getYearlyReport(req.user.userId, year);
    return sendSuccess(res, 200, "Yearly report retrieved", data);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}

export async function yearComparison(req, res) {
  try {
    const { years } = req.query;
    if (!years) {
      return sendError(res, 400, "Years query parameter is required (e.g. ?years=2025,2026)");
    }

    const data = await getYearComparison(req.user.userId, years);
    return sendSuccess(res, 200, "Year comparison retrieved", data);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || "Internal server error");
  }
}
