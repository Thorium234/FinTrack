import { apiRequest } from "../api/axios.js";

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload
  });
}

export function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload
  });
}

export function fetchProfile() {
  return apiRequest("/auth/profile");
}
