import { request } from "./http.js";

export function fetchProducts({ search, page } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (page) qs.set("page", page);

  const query = qs.toString();
  return request(`/products/${query ? `?${query}` : ""}`);
}

export function fetchProductDetail(productId) {
  return request(`/products/${productId}/`);
}

export function fetchSellerProducts(sellerName, { page } = {}) {
  const qs = new URLSearchParams();
  if (page) qs.set("page", page);

  const query = qs.toString();
  return request(`/${encodeURIComponent(sellerName)}/products/${query ? `?${query}` : ""}`);
}
