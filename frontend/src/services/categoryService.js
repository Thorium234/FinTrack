import { apiRequest } from "../api/axios.js";

export async function fetchCategories() {
  const data = await apiRequest("/categories");
  return data.categories || [];
}

export async function createCategory(payload) {
  const data = await apiRequest("/categories", {
    method: "POST",
    body: payload
  });

  return data.category;
}

export async function updateCategory(id, payload) {
  const data = await apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: payload
  });

  return data.category;
}

export async function deleteCategory(id) {
  return apiRequest(`/categories/${id}`, {
    method: "DELETE"
  });
}
