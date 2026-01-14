// assets/js/api/products.js
import { apiRequest } from "./client.js";

/**
 * 상품 목록 불러오기
 * @param {Object} params
 * @param {string|null} params.nextUrl - 페이지네이션 next URL (있으면 우선 사용)
 * @param {string} params.search - 검색어 (없으면 전체)
 */
export async function fetchProducts({ nextUrl = null, search = "" } = {}) {
  if (nextUrl) {
    return apiRequest(nextUrl, { method: "GET" });
  }

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/products/${query}`, { method: "GET" });
}

/**
 * 상품 상세 불러오기
 * @param {number|string} productId
 */
export async function fetchProductDetail(productId) {
  return apiRequest(`/products/${productId}/`, { method: "GET" });
}
