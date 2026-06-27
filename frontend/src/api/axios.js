const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const AUTH_TOKEN_KEY = "fintrack_auth_token";
export const AUTH_USER_KEY = "fintrack_auth_user";

function buildQueryString(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => {
    return value !== undefined && value !== null && value !== "";
  });

  if (entries.length === 0) {
    return "";
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.set(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

export function buildApiUrl(path, params) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${DEFAULT_API_BASE_URL}${normalizedPath}${buildQueryString(params)}`;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    token,
    headers = {},
    responseType = "json"
  } = options;

  const requestHeaders = { ...headers };
  const authToken = token || window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  let requestBody = body;

  if (body !== undefined && body !== null && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path, params), {
    method,
    headers: requestHeaders,
    body: requestBody
  });

  if (responseType === "blob") {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(errorData?.message || "Request failed");
      error.statusCode = response.status;
      throw error;
    }

    return response.blob();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.statusCode = response.status;
    error.payload = data;
    throw error;
  }

  return data;
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
