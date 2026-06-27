import axios from "axios";

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const AUTH_TOKEN_KEY = "fintrack_auth_token";
export const AUTH_USER_KEY = "fintrack_auth_user";

const client = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  withCredentials: true
});

client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "Request failed";
    const err = new Error(message);
    err.statusCode = error.response?.status;
    err.payload = error.response?.data;
    return Promise.reject(err);
  }
);

export function buildApiUrl(path, params) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${DEFAULT_API_BASE_URL}${normalizedPath}`;
  if (params) {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
    if (entries.length) {
      url += `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`;
    }
  }
  return url;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    headers = {},
    responseType = "json"
  } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const config = {
    method: method.toLowerCase(),
    url: path,
    params,
    headers,
    responseType
  };

  if (body !== undefined && body !== null) {
    config.data = body;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
  }

  return client.request(config);
}

export function setStoredAuthSession({ token, user }) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function readStoredAuthSession() {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);
  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }
  return { token, user };
}
