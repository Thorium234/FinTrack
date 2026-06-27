import { apiRequest } from "../api/axios.js";

export async function fetchRecurringTransactions() {
  const data = await apiRequest("/recurring");
  return data.recurringTransactions || [];
}

export async function createRecurringTransaction(payload) {
  const data = await apiRequest("/recurring", {
    method: "POST",
    body: payload
  });
  return data.recurringTransaction;
}

export async function updateRecurringTransaction(id, payload) {
  const data = await apiRequest(`/recurring/${id}`, {
    method: "PUT",
    body: payload
  });
  return data.recurringTransaction;
}

export async function deleteRecurringTransaction(id) {
  return apiRequest(`/recurring/${id}`, {
    method: "DELETE"
  });
}
