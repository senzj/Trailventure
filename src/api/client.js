const TOKEN_KEY = "trailventure_token";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Thin wrapper around fetch that:
 * - attaches the auth token when present
 * - serializes JSON bodies
 * - normalizes errors into Error objects with a `status` field
 */
async function request(path, { method = "GET", body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export default request;