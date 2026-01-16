import { apiRequest } from "./client.js";

export async function fetchProducts({ nextUrl = null, search = "" } = {}) {
  if (nextUrl) {
    return apiRequest(nextUrl, { method: "GET" });
  }

  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/products/${qs}`, { method: "GET" });
}

export async function fetchSellerProducts(
  sellerName,
  { nextUrl = null } = {}
) {
  if (!sellerName) throw new Error("sellerName이 필요합니다.");

  if (nextUrl) {
    return apiRequest(nextUrl, { method: "GET" });
  }

  const safeSeller = encodeURIComponent(sellerName);
  return apiRequest(`/${safeSeller}/products/`, { method: "GET" });
}

export async function fetchProductDetail(productId) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "GET",
  });
}

export async function createProduct(payload) {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("info", payload.info);
  fd.append("image", payload.image);
  fd.append("price", String(payload.price));
  fd.append("shipping_method", payload.shipping_method);
  fd.append("shipping_fee", String(payload.shipping_fee));
  fd.append("stock", String(payload.stock));

  return apiRequest("/products/", {
    method: "POST",
    body: fd,
  });
}

export async function updateProduct(productId, patch = {}) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  const fd = new FormData();
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, typeof value === "number" ? String(value) : value);
  });

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "PUT",
    body: fd,
  });
}

export async function deleteProduct(productId) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "DELETE",
  });
}

export async function fetchMyInfo() {
  const candidates = [
    "/accounts/user/",
    "/accounts/profile/",
    "/user/",
    "/users/me/",
    "/users/user/",
    "/accounts/me/",
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      return await apiRequest(url, { method: "GET" });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("내 정보 조회 API를 찾지 못했습니다.");
}

export async function getUserType() {
  const me = await fetchMyInfo();
  return me?.user_type || null;
}

export async function getAuthSellerName() {
  const me = await fetchMyInfo();
  return (
    me?.name ||
    me?.store_name ||
    me?.username ||
    null
  );
}
