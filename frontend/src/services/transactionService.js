import { apiRequest } from "../api/axios.js";

function asFormData(payload) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (key === "receiptFile") {
      formData.append("receipt", value);
      continue;
    }

    formData.append(key, value);
  }

  return formData;
}

export async function fetchTransactions(params = {}) {
  const data = await apiRequest("/transactions", { params });
  return data.transactions || [];
}

export async function fetchTransactionSummary(month) {
  return apiRequest("/transactions/summary", {
    params: month ? { month } : undefined
  });
}

export async function createTransaction(payload) {
  const body = payload.receiptFile ? asFormData(payload) : payload;
  const data = await apiRequest("/transactions", {
    method: "POST",
    body
  });

  return data.transaction;
}

export async function updateTransaction(id, payload) {
  const body = payload.receiptFile ? asFormData(payload) : payload;
  const data = await apiRequest(`/transactions/${id}`, {
    method: "PUT",
    body
  });

  return data.transaction;
}

export async function deleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, {
    method: "DELETE"
  });
}
