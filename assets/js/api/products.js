// assets/js/api/products.js
import { apiRequest } from "./client.js";

/**
 * 3.1 상품 전체 불러오기 / 3.6 검색
 * GET /products/
 * GET /products/?search=입력값
 *
 * @param {Object} params
 * @param {string|null} params.nextUrl - 페이지네이션 next URL(absolute일 수 있음)
 * @param {string} params.search - 검색어(선택)
 */
export async function fetchProducts({ nextUrl = null, search = "" } = {}) {
  if (nextUrl) {
    return apiRequest(nextUrl, { method: "GET" });
  }

  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/products/${qs}`, { method: "GET" });
}

/**
 * 3.1.2 판매자 상품 불러오기
 * GET /<str:seller_name>/products/
 *
 * @param {string} sellerName - 판매자의 name (명세 기준)
 * @param {Object} params
 * @param {string|null} params.nextUrl
 */
export async function fetchSellerProducts(
  sellerName,
  { nextUrl = null } = {}
) {
  if (!sellerName) throw new Error("sellerName이 필요합니다.");

  if (nextUrl) {
    return apiRequest(nextUrl, { method: "GET" });
  }

  // sellerName에 공백/특수문자 있을 수 있으니 인코딩
  const safeSeller = encodeURIComponent(sellerName);
  return apiRequest(`/${safeSeller}/products/`, { method: "GET" });
}

/**
 * 3.3 상품 디테일
 * GET /products/<int:product_id>/
 */
export async function fetchProductDetail(productId) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "GET",
  });
}

/**
 * 3.2 상품 등록 (seller만 가능)
 * POST /products/
 *
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.info
 * @param {File}   payload.image
 * @param {number} payload.price
 * @param {"PARCEL"|"DELIVERY"} payload.shipping_method
 * @param {number} payload.shipping_fee
 * @param {number} payload.stock
 */
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

/**
 * 3.4 상품 수정 (PUT)
 * PUT /products/<int:product_id>/
 * - 명세: 수정 필요한 값만 보내도 됨
 * - 파일(image) 포함 가능성이 있으니 FormData로 통일 권장
 *
 * @param {number|string} productId
 * @param {Object} patch - 필요한 필드만 전달
 */
export async function updateProduct(productId, patch = {}) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  const fd = new FormData();
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // 숫자는 문자열로
    fd.append(key, typeof value === "number" ? String(value) : value);
  });

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "PUT",
    body: fd,
  });
}

/**
 * 3.5 상품 삭제
 * DELETE /products/<int:product_id>/
 */
export async function deleteProduct(productId) {
  if (productId === undefined || productId === null || productId === "")
    throw new Error("productId가 필요합니다.");

  return apiRequest(`/products/${encodeURIComponent(productId)}/`, {
    method: "DELETE",
  });
}
