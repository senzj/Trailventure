// Computes the effective, discounted price of a product.
// `discount` is stored as a percentage (0–100).
export function discountedPrice(product) {
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  return Math.max(0, price * (1 - discount / 100));
}

export function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}