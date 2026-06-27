import { apiRequest } from "../api/axios.js";

export async function fetchBudgets(month) {
  const data = await apiRequest("/budgets", {
    params: month ? { month } : undefined
  });

  return data.budgets || [];
}

export async function fetchBudgetSummary(month) {
  return apiRequest("/budgets/summary", {
    params: month ? { month } : undefined
  });
}

export async function createBudget(payload) {
  const data = await apiRequest("/budgets", {
    method: "POST",
    body: payload
  });

  return data.budget;
}

export async function updateBudget(id, payload) {
  const data = await apiRequest(`/budgets/${id}`, {
    method: "PUT",
    body: payload
  });

  return data.budget;
}

export async function deleteBudget(id) {
  return apiRequest(`/budgets/${id}`, {
    method: "DELETE"
  });
}
