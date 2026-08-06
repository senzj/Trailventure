import request from "./client";

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  }
  const qs = query.toString();
  const data = await request(`/api/products${qs ? `?${qs}` : ""}`);
  return data.products;
}

export async function fetchProduct(id) {
  const data = await request(`/api/products/${id}`);
  return data.product;
}

function toFormData(product) {
  const formData = new FormData();
  if (product.name !== undefined) formData.append("name", product.name);
  if (product.description !== undefined) formData.append("description", product.description);
  if (product.price !== undefined) formData.append("price", product.price);
  if (product.discount !== undefined) formData.append("discount", product.discount);
  if (product.stock !== undefined) formData.append("stock", product.stock);
  if (product.categoryId !== undefined) formData.append("categoryId", product.categoryId);
  if (product.image instanceof File) formData.append("image", product.image);
  return formData;
}

export async function createProduct(product) {
  const data = await request("/api/products", {
    method: "POST",
    formData: toFormData(product),
  });
  return data.product;
}

export async function updateProduct(id, product) {
  const data = await request(`/api/products/${id}`, {
    method: "PUT",
    formData: toFormData(product),
  });
  return data.product;
}

export async function deleteProduct(id) {
  await request(`/api/products/${id}`, { method: "DELETE" });
}