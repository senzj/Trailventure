import request from "./client";

export async function createOrder(payload) {
  const data = await request("/api/orders", {
    method: "POST",
    body: payload,
  });
  return data.order;
}

export async function fetchOrders(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  }
  const qs = query.toString();
  const data = await request(`/api/orders${qs ? `?${qs}` : ""}`);
  return data.orders;
}

export async function updateOrderStatus(id, status) {
  const data = await request(`/api/orders/${id}/status`, {
    method: "PUT",
    body: { status },
  });
  return data.order;
}

export async function fetchMyOrders() {
  const data = await request("/api/orders/mine");
  return data.orders;
}