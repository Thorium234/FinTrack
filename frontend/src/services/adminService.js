import { apiRequest } from "../api/axios.js";

export async function fetchAdminUsers() {
  const data = await apiRequest("/admin/users");
  return data.users || [];
}

export async function fetchUserData(userId) {
  return apiRequest(`/admin/users/${userId}`);
}
