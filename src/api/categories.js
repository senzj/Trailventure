import request from "./client";

export async function fetchCategories() {
  const data = await request("/api/categories");
  return data.categories;
}