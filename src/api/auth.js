import request, { setToken, clearToken, getToken } from "./client";

export async function login({ email, password }) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setToken(data.token);
  return data.user;
}

export async function signup({ email, password }) {
  const data = await request("/api/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  setToken(data.token);
  return data.user;
}

export async function getCurrentUser() {
  if (!getToken()) return null;
  const data = await request("/api/auth/me");
  return data.user;
}

export async function logout() {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } catch {
    // session already gone; ignore
  }
  clearToken();
}

export async function updateProfile(patch) {
  const data = await request("/api/auth/me", {
    method: "PUT",
    body: patch,
  });
  return data.user;
}