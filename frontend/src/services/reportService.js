import { apiRequest } from "../api/axios.js";

export async function fetchYearlyReport(year) {
  return apiRequest("/reports/yearly", {
    params: { year }
  });
}

export async function fetchYearComparison(years) {
  return apiRequest("/reports/yoy", {
    params: { years }
  });
}
