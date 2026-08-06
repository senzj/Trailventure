import request from "./client";

export async function fetchUsers() {
  const data = await request("/api/users");
  return data.users;
}

export async function createUser(payload) {
  const data = await request("/api/users", {
    method: "POST",
    body: payload,
  });
  return data.user;
}

export async function updateUser(id, payload) {
  const data = await request(`/api/users/${id}`, {
    method: "PUT",
    body: payload,
  });
  return data.user;
}

export async function updateUserRole(id, role) {
  const data = await request(`/api/users/${id}/role`, {
    method: "PUT",
    body: { role },
  });
  return data.user;
}

export async function deleteUser(id) {
  await request(`/api/users/${id}`, { method: "DELETE" });
}