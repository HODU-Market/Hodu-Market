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

/**
 * (추가) 현재 로그인 사용자 정보 조회
 * - seller 여부 판단 및 sellerName(명세 기준) 확보 용도
 * - 프로젝트마다 엔드포인트가 다를 수 있어 fallback 시도
 *
 * @returns {Promise<Object>} me
 */
export async function fetchMyInfo() {
  // 팀 프로젝트에서 자주 쓰는 후보 엔드포인트들
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
      // apiRequest가 baseURL 붙여주는 구조이므로 상대경로 사용
      // 인증 필요하므로 skipAuth 옵션 없음(기본 auth 포함 기대)
      return await apiRequest(url, { method: "GET" });
    } catch (err) {
      lastError = err;
      // 다음 후보로 계속 시도
    }
  }

  // 전부 실패하면 마지막 에러 throw
  throw lastError || new Error("내 정보 조회 API를 찾지 못했습니다.");
}

/**
 * (추가) user_type 빠른 확인용
 * - "SELLER" | "BUYER" 형태 기대
 */
export async function getUserType() {
  const me = await fetchMyInfo();
  return me?.user_type || null;
}

/**
 * (추가) 판매자 상품 조회용 sellerName 확보
 * - 명세의 seller_name이 무엇을 의미하는지 프로젝트마다 다를 수 있어
 *   name/store_name/username을 우선순위로 반환
 *
 * @returns {Promise<string|null>}
 */
export async function getAuthSellerName() {
  const me = await fetchMyInfo();

  // 우선순위: 명세에서 seller.name을 쓰는 경우가 많지만,
  // 실제로는 store_name / username이 라우팅 키인 경우도 있어 안전하게 처리
  return (
    me?.name ||
    me?.store_name ||
    me?.username ||
    null
  );
}
