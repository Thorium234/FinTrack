import { apiRequest } from "../api/axios.js";

export async function fetchGoals() {
  const data = await apiRequest("/goals");
  return data.goals || [];
}

export async function createGoal(payload) {
  const data = await apiRequest("/goals", {
    method: "POST",
    body: payload
  });
  return data.goal;
}

export async function updateGoal(id, payload) {
  const data = await apiRequest(`/goals/${id}`, {
    method: "PUT",
    body: payload
  });
  return data.goal;
}

export async function deleteGoal(id) {
  return apiRequest(`/goals/${id}`, {
    method: "DELETE"
  });
}
