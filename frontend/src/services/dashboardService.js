import { apiRequest } from "../api/axios.js";

export async function fetchDashboardSummary(month) {
  return apiRequest("/dashboard/summary", {
    params: month ? { month } : undefined
  });
}
