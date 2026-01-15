import { authRequestWithRefresh } from "./http.js";

/**
 * 장바구니 목록 조회
 * GET /cart/
 * @param {Object} options - 페이지네이션 옵션
 * @param {number} options.page - 페이지 번호
 * @returns {Promise<{count: number, next: string|null, previous: string|null, results: Array}>}
 */
export async function fetchCart({ page } = {}) {
  const qs = new URLSearchParams();
  if (page) qs.set("page", page);

  const query = qs.toString();
  return authRequestWithRefresh(`/cart/${query ? `?${query}` : ""}`);
}

/**
 * 장바구니에 상품 추가
 * POST /cart/
 * 이미 있는 상품이면 수량이 더해짐
 * @param {number} productId - 상품 ID
 * @param {number} quantity - 수량
 * @returns {Promise<{detail: string}>}
 */
export async function addToCart(productId, quantity) {
  return authRequestWithRefresh("/cart/", {
    method: "POST",
    body: {
      product_id: productId,
      quantity: quantity,
    },
  });
}

/**
 * 장바구니 아이템 상세 조회
 * GET /cart/:cartItemId/
 * @param {number} cartItemId - 장바구니 아이템 ID
 * @returns {Promise<{id: number, product: Object, quantity: number, added_at: string}>}
 */
export async function fetchCartItem(cartItemId) {
  return authRequestWithRefresh(`/cart/${cartItemId}/`);
}

/**
 * 장바구니 수량 수정
 * PUT /cart/:cartItemId/
 * @param {number} cartItemId - 장바구니 아이템 ID
 * @param {number} quantity - 새로운 수량
 * @returns {Promise<{id: number, product: Object, quantity: number, created_at: string, updated_at: string}>}
 */
export async function updateCartItemQuantity(cartItemId, quantity) {
  return authRequestWithRefresh(`/cart/${cartItemId}/`, {
    method: "PUT",
    body: { quantity },
  });
}

/**
 * 장바구니 개별 아이템 삭제
 * DELETE /cart/:cartItemId/
 * @param {number} cartItemId - 장바구니 아이템 ID
 * @returns {Promise<{detail: string}>}
 */
export async function removeCartItem(cartItemId) {
  return authRequestWithRefresh(`/cart/${cartItemId}/`, {
    method: "DELETE",
  });
}

/**
 * 장바구니 전체 삭제
 * DELETE /cart/
 * @returns {Promise<{detail: string}>}
 */
export async function clearCart() {
  return authRequestWithRefresh("/cart/", {
    method: "DELETE",
  });
}

/**
 * 장바구니 아이템들의 총 금액 계산
 * @param {Array} cartItems - 장바구니 아이템 배열
 * @returns {{totalProductPrice: number, totalShippingFee: number, totalPrice: number}}
 */
export function calculateCartTotal(cartItems) {
  let totalProductPrice = 0;
  let totalShippingFee = 0;

  cartItems.forEach((item) => {
    const product = item.product;
    totalProductPrice += product.price * item.quantity;
    totalShippingFee += product.shipping_fee;
  });

  return {
    totalProductPrice,
    totalShippingFee,
    totalPrice: totalProductPrice + totalShippingFee,
  };
}

/**
 * 선택된 장바구니 아이템들의 총 금액 계산
 * @param {Array} cartItems - 장바구니 아이템 배열
 * @param {Array<number>} selectedIds - 선택된 아이템 ID 배열
 * @returns {{totalProductPrice: number, totalShippingFee: number, totalPrice: number}}
 */
export function calculateSelectedTotal(cartItems, selectedIds) {
  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
  return calculateCartTotal(selectedItems);
}
