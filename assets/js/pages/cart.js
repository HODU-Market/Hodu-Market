// cart.js
import { tokenManager } from "../api/config.js";
import { Modal } from "../utils/modal.js";
import {
  fetchCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  calculateCartTotal,
  calculateSelectedTotal,
} from "../api/cart.api.js";

/**
 * 장바구니 데이터 관리
 */
const cartData = {
  items: [],
  isLoading: false,

  // 장바구니 데이터 로드
  async loadCart() {
    this.isLoading = true;
    cartUI.showLoading();

    try {
      // 로그인 체크
      if (!tokenManager.isLoggedIn()) {
        cartUI.showLoginRequired();
        loginModal.open();
        return;
      }

      // BUYER만 장바구니 접근 가능
      if (!tokenManager.isBuyer()) {
        cartUI.showError("구매자만 장바구니를 이용할 수 있습니다.");
        return;
      }

      const response = await fetchCart();
      this.items = response.results;
      cartUI.renderCartItems(this.items);
      cartUI.updateSummary(this.items);
      cartEmpty.checkEmpty();
    } catch (error) {
      console.error("장바구니 로드 실패:", error);
      cartUI.showError(error.message);
    } finally {
      this.isLoading = false;
      cartUI.hideLoading();
    }
  },

  // 수량 변경
  async updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) return;

    try {
      const item = this.items.find((item) => item.id === cartItemId);
      if (!item) return;

      // 재고 체크
      if (newQuantity > item.product.stock) {
        stockModal.open({ maxStock: item.product.stock });
        return;
      }

      await updateCartItemQuantity(cartItemId, newQuantity);

      // 로컬 데이터 업데이트
      item.quantity = newQuantity;
      cartUI.updateItemQuantity(cartItemId, newQuantity, item.product.price);
      cartUI.updateSummary(this.items);
    } catch (error) {
      console.error("수량 변경 실패:", error);
      alert("수량 변경에 실패했습니다.");
    }
  },

  // 개별 아이템 삭제
  async removeItem(cartItemId) {
    try {
      await removeCartItem(cartItemId);

      // 로컬 데이터에서 제거
      this.items = this.items.filter((item) => item.id !== cartItemId);
      cartUI.removeItemElement(cartItemId);
      cartUI.updateSummary(this.items);
      cartEmpty.checkEmpty();
      cartCheckbox.refresh();

      alert("상품이 장바구니에서 삭제되었습니다.");
    } catch (error) {
      console.error("아이템 삭제 실패:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  },

  // 전체 삭제
  async clearAllItems() {
    try {
      await clearCart();
      this.items = [];
      cartUI.clearAllItemElements();
      cartUI.updateSummary([]);
      cartEmpty.checkEmpty();
    } catch (error) {
      console.error("전체 삭제 실패:", error);
      alert("전체 삭제에 실패했습니다.");
    }
  },

  // 선택된 아이템 ID 목록 가져오기
  getSelectedItemIds() {
    const checkboxes = document.querySelectorAll('input[name="cart-item"]:checked');
    return Array.from(checkboxes).map((cb) => parseInt(cb.value, 10));
  },

  // 선택된 아이템 정보 가져오기
  getSelectedItems() {
    const selectedIds = this.getSelectedItemIds();
    return this.items.filter((item) => selectedIds.includes(item.id));
  },
};

/**
 * 장바구니 UI 관리
 */
const cartUI = {
  listContainer: null,
  summaryContainer: null,
  loadingElement: null,

  init() {
    this.listContainer = document.querySelector(".cart__list");
    this.summaryContainer = document.querySelector(".cart__summary");
  },

  // 로딩 상태 표시
  showLoading() {
    if (!this.loadingElement) {
      this.loadingElement = document.createElement("div");
      this.loadingElement.className = "cart__loading";
      this.loadingElement.innerHTML = "<p>장바구니를 불러오는 중...</p>";
    }
    this.listContainer?.parentNode?.insertBefore(this.loadingElement, this.listContainer);
  },

  hideLoading() {
    this.loadingElement?.remove();
  },

  // 로그인 필요 안내
  showLoginRequired() {
    const emptyState = document.querySelector(".cart__empty");
    if (emptyState) {
      emptyState.innerHTML = `
        <p class="cart__empty-title">로그인이 필요합니다.</p>
        <p class="cart__empty-desc">로그인 후 장바구니를 이용해주세요.</p>
      `;
      emptyState.hidden = false;
    }
    this.listContainer?.classList.add("is-hidden");
    this.summaryContainer?.classList.add("is-hidden");
    document.querySelector(".cart__order-btn")?.classList.add("is-hidden");
  },

  // 에러 메시지 표시
  showError(message) {
    const emptyState = document.querySelector(".cart__empty");
    if (emptyState) {
      emptyState.innerHTML = `<p class="cart__empty-title">${message}</p>`;
      emptyState.hidden = false;
    }
    this.listContainer?.classList.add("is-hidden");
    this.summaryContainer?.classList.add("is-hidden");
    document.querySelector(".cart__order-btn")?.classList.add("is-hidden");
  },

  // 장바구니 아이템 렌더링
  renderCartItems(items) {
    if (!this.listContainer) return;

    if (items.length === 0) {
      this.listContainer.innerHTML = "";
      return;
    }

    this.listContainer.innerHTML = items.map((item) => this.createCartItemHTML(item)).join("");

    // 이벤트 바인딩
    this.bindItemEvents();

    // 전체 선택 버튼 상태 업데이트 (모든 아이템이 선택된 상태이므로)
    cartCheckbox.updateSelectAll();
  },

  // 장바구니 아이템 HTML 생성 (HTML 구조에 맞춤)
  createCartItemHTML(item) {
    const { id, product, quantity } = item;
    const itemTotal = product.price * quantity;
    const shippingText = product.shipping_method === "PARCEL" ? "택배배송" : "직접배송";
    const shippingFeeText =
      product.shipping_fee === 0 ? "무료배송" : `${product.shipping_fee.toLocaleString()}원`;

    return `
      <li class="cart-item" data-cart-id="${id}" data-product-id="${product.id}">
        <label class="cart-item__checkbox">
          <input type="checkbox" name="cart-item" value="${id}" checked />
          <span class="sr-only">상품 선택</span>
        </label>

        <article class="cart-item__info">
          <figure class="cart-item__img">
            <img src="${product.image}" alt="${product.name}" />
          </figure>
          <dl class="cart-item__detail">
            <dt class="sr-only">판매자</dt>
            <dd class="cart-item__seller">${product.seller?.store_name || ""}</dd>
            <dt class="sr-only">상품명</dt>
            <dd class="cart-item__name">${product.name}</dd>
            <dt class="sr-only">가격</dt>
            <dd class="cart-item__price">${product.price.toLocaleString()}원</dd>
            <dt class="sr-only">배송</dt>
            <dd class="cart-item__delivery">${shippingText} / ${shippingFeeText}</dd>
          </dl>
        </article>

        <fieldset class="qty-control" data-stock="${product.stock}">
          <legend class="sr-only">수량 조절</legend>
          <button type="button" class="qty-control__btn qty-control__btn--minus" data-action="decrease">
            <span class="sr-only">수량 감소</span>
          </button>
          <input
            type="number"
            value="${quantity}"
            min="1"
            max="${product.stock}"
            class="qty-control__input"
            aria-label="수량"
            readonly
          />
          <button type="button" class="qty-control__btn qty-control__btn--plus" data-action="increase">
            <span class="sr-only">수량 증가</span>
          </button>
        </fieldset>

        <p class="cart-item__total">
          <output class="cart-item__total-price">${itemTotal.toLocaleString()}원</output>
          <button type="button" class="cart-item__order-btn">주문하기</button>
        </p>

        <button type="button" class="cart-item__delete">
          <span class="sr-only">삭제</span>
        </button>
      </li>
    `;
  },

  // 아이템 이벤트 바인딩
  bindItemEvents() {
    // 초기 버튼 상태 설정
    document.querySelectorAll(".cart-item").forEach((cartItem) => {
      this.updateQtyButtonState(cartItem);
    });

    // 수량 버튼 이벤트
    document.querySelectorAll(".qty-control__btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const cartId = parseInt(cartItem.dataset.cartId, 10);
        const input = cartItem.querySelector(".qty-control__input");
        const currentQty = parseInt(input.value, 10);
        const action = e.target.closest("button").dataset.action;

        const newQty = action === "increase" ? currentQty + 1 : currentQty - 1;
        cartData.updateQuantity(cartId, newQty);
      });
    });

    // 삭제 버튼 이벤트
    document.querySelectorAll(".cart-item__delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const cartId = parseInt(cartItem.dataset.cartId, 10);
        deleteModal.open({
          targetCartId: cartId,
          targetItem: cartItem,
        });
      });
    });

    // 개별 주문 버튼 이벤트
    document.querySelectorAll(".cart-item__order-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        const cartId = parseInt(cartItem.dataset.cartId, 10);
        const item = cartData.items.find((i) => i.id === cartId);
        if (item) {
          // 주문 페이지로 이동 (direct_order)
          const orderData = {
            order_kind: "direct_order",
            product: item.product.id,
            quantity: item.quantity,
            from_cart: true,
            cart_item_id: cartId,
          };
          sessionStorage.setItem("orderData", JSON.stringify(orderData));
          openPreparingModal("이 페이지는 준비중입니다.");
          return;
        }
      });
    });

    // 체크박스 변경 시 합계 업데이트
    document.querySelectorAll('input[name="cart-item"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        cartCheckbox.updateSelectAll();
        this.updateSelectedSummary();
      });
    });
  },

  // 아이템 수량 업데이트
  updateItemQuantity(cartItemId, quantity, unitPrice) {
    const itemEl = document.querySelector(`[data-cart-id="${cartItemId}"]`);
    if (!itemEl) return;

    const input = itemEl.querySelector(".qty-control__input");
    const totalPrice = itemEl.querySelector(".cart-item__total-price");

    if (input) input.value = quantity;
    if (totalPrice) {
      totalPrice.textContent = `${(unitPrice * quantity).toLocaleString()}원`;
    }

    // 버튼 상태 업데이트
    this.updateQtyButtonState(itemEl);
  },

  // 수량 버튼 활성화/비활성화 상태 업데이트
  updateQtyButtonState(cartItem) {
    const control = cartItem.querySelector(".qty-control");
    if (!control) return;

    const minusBtn = control.querySelector(".qty-control__btn--minus");
    const plusBtn = control.querySelector(".qty-control__btn--plus");
    const input = control.querySelector(".qty-control__input");
    const stock = parseInt(control.dataset.stock, 10) || 0;
    const value = parseInt(input.value, 10) || 1;

    // 수량이 1이면 - 버튼 비활성화 (스타일만)
    if (minusBtn) {
      minusBtn.classList.toggle("is-disabled", value <= 1);
    }

    // 수량이 재고와 같거나 재고가 0이면 + 버튼 비활성화 (스타일만)
    if (plusBtn) {
      plusBtn.classList.toggle("is-disabled", value >= stock || stock === 0);
    }
  },

  // 아이템 요소 제거
  removeItemElement(cartItemId) {
    const itemEl = document.querySelector(`[data-cart-id="${cartItemId}"]`);
    itemEl?.remove();
  },

  // 전체 아이템 요소 제거
  clearAllItemElements() {
    if (this.listContainer) {
      this.listContainer.innerHTML = "";
    }
  },

  // 합계 업데이트 (HTML 구조에 맞춤)
  updateSummary(items) {
    const { totalProductPrice, totalShippingFee, totalPrice } = calculateCartTotal(items);

    const summaryItems = document.querySelectorAll(".cart__summary-item");

    // 총 상품금액 (첫 번째)
    if (summaryItems[0]) {
      const output = summaryItems[0].querySelector(".amount");
      if (output) output.textContent = totalProductPrice.toLocaleString();
    }

    // 상품 할인 (두 번째) - 현재 API에 할인 정보 없음, 0원 유지
    if (summaryItems[1]) {
      const output = summaryItems[1].querySelector(".amount");
      if (output) output.textContent = "0";
    }

    // 배송비 (세 번째)
    if (summaryItems[2]) {
      const output = summaryItems[2].querySelector(".amount");
      if (output) output.textContent = totalShippingFee.toLocaleString();
    }

    // 결제 예정 금액 (네 번째, .cart__summary-item--total)
    const totalItem = document.querySelector(".cart__summary-item--total");
    if (totalItem) {
      const output = totalItem.querySelector(".amount");
      if (output) output.textContent = totalPrice.toLocaleString();
    }
  },

  // 선택된 아이템 합계 업데이트
  updateSelectedSummary() {
    const selectedIds = cartData.getSelectedItemIds();
    const { totalProductPrice, totalShippingFee, totalPrice } = calculateSelectedTotal(
      cartData.items,
      selectedIds
    );

    const summaryItems = document.querySelectorAll(".cart__summary-item");

    if (summaryItems[0]) {
      const output = summaryItems[0].querySelector(".amount");
      if (output) output.textContent = totalProductPrice.toLocaleString();
    }

    if (summaryItems[1]) {
      const output = summaryItems[1].querySelector(".amount");
      if (output) output.textContent = "0";
    }

    if (summaryItems[2]) {
      const output = summaryItems[2].querySelector(".amount");
      if (output) output.textContent = totalShippingFee.toLocaleString();
    }

    const totalItem = document.querySelector(".cart__summary-item--total");
    if (totalItem) {
      const output = totalItem.querySelector(".amount");
      if (output) output.textContent = totalPrice.toLocaleString();
    }
  },
};

/**
 * 빈 장바구니 상태 관리
 */
const cartEmpty = {
  emptyState: null,
  cartList: null,
  cartSummary: null,
  orderBtn: null,
  selectAll: null,

  init() {
    this.emptyState = document.querySelector(".cart__empty");
    this.cartList = document.querySelector(".cart__list");
    this.cartSummary = document.querySelector(".cart__summary");
    this.orderBtn = document.querySelector(".cart__order-btn");
    this.selectAll = document.getElementById("select-all");
  },

  checkEmpty() {
    const isEmpty = cartData.items.length === 0;

    // 빈 상태 메시지
    if (this.emptyState) {
      this.emptyState.hidden = !isEmpty;
    }

    // 상품 목록
    if (this.cartList) {
      if (isEmpty) {
        this.cartList.classList.add("is-hidden");
      } else {
        this.cartList.classList.remove("is-hidden");
      }
    }

    // 결제 금액 요약
    if (this.cartSummary) {
      if (isEmpty) {
        this.cartSummary.classList.add("is-hidden");
      } else {
        this.cartSummary.classList.remove("is-hidden");
      }
    }

    // 주문하기 버튼
    if (this.orderBtn) {
      if (isEmpty) {
        this.orderBtn.classList.add("is-hidden");
      } else {
        this.orderBtn.classList.remove("is-hidden");
      }
    }

    // 전체 선택 체크박스
    if (this.selectAll) {
      this.selectAll.disabled = isEmpty;
      if (isEmpty) {
        this.selectAll.checked = false;
      }
    }
  },
};

/**
 * 체크박스 관리 (전체 선택/개별 선택)
 */
const cartCheckbox = {
  selectAll: null,

  init() {
    this.selectAll = document.getElementById("select-all");
    if (!this.selectAll) return;

    this.selectAll.addEventListener("change", () => this.handleSelectAll());
  },

  handleSelectAll() {
    const isChecked = this.selectAll.checked;
    const itemCheckboxes = document.querySelectorAll('input[name="cart-item"]');
    itemCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
    cartUI.updateSelectedSummary();
  },

  updateSelectAll() {
    if (!this.selectAll) return;

    const itemCheckboxes = document.querySelectorAll('input[name="cart-item"]');
    const total = itemCheckboxes.length;
    const checked = Array.from(itemCheckboxes).filter((cb) => cb.checked).length;

    if (total === 0) {
      this.selectAll.checked = false;
      this.selectAll.indeterminate = false;
    } else {
      this.selectAll.checked = total === checked;
      this.selectAll.indeterminate = checked > 0 && checked < total;
    }
  },

  refresh() {
    this.updateSelectAll();
  },
};

/**
 * 삭제 확인 모달 관리
 */
const deleteModal = new Modal("deleteModal", {
  confirmCallback: async (state) => {
    if (state.targetCartId) {
      await cartData.removeItem(state.targetCartId);
    }
  },
});

/**
 * 로그인 필요 모달 관리
 */
const loginModal = new Modal("login-modal", {
  confirmCallback: () => {
    window.location.href = "/join/login.html";
  },
});

/**
 * 장바구니 존재 모달 관리
 */
const cartExistsModal = new Modal("cartExistsModal", {
  confirmCallback: () => {
    window.location.href = "/cart/shopcart.html";
  },
});

/**
 * 재고 초과 모달 관리
 */
const stockModal = new Modal("stockModal", {
  beforeOpen: (data) => {
    const maxSpan = document.getElementById("stockModalMax");
    if (maxSpan && data.maxStock !== undefined) {
      maxSpan.textContent = data.maxStock;
    }
  },
});

/**
 * 주문하기 버튼 관리
 */

function openPreparingModal(message = "이 페이지는 준비중입니다.") {
  if (document.getElementById("preparing-modal")) return;

  const modal = document.createElement("section");
  modal.className = "modal";
  modal.id = "preparing-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  modal.innerHTML = `
    <div class="modal__overlay" data-close="true"></div>
    <div class="modal__content modal--login">
      <button type="button" class="modal__close" aria-label="닫기" data-close="true"></button>
      <p class="modal__message">${message}</p>
      <div class="modal__actions">
        <button type="button" class="modal__btn modal__btn--confirm" data-close="true">확인</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") {
      modal.remove();
    }
  });

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", onKeyDown);
    }
  };
  document.addEventListener("keydown", onKeyDown);
}

const orderButton = {
  init() {
    const orderBtn = document.querySelector(".cart__order-btn");
    if (!orderBtn) return;

    // form submit 방지
    const cartForm = document.querySelector(".cart__form");
    if (cartForm) {
      cartForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleOrder();
      });
    }
  },

  handleOrder() {
    const selectedItems = cartData.getSelectedItems();

    if (selectedItems.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }

    // 선택된 아이템들의 cart_item_id 배열
    const cartItemIds = selectedItems.map((item) => item.id);
    const { totalPrice } = calculateSelectedTotal(cartData.items, cartItemIds);

    const orderData = {
      order_type: "cart_order",
      cart_items: cartItemIds,
      total_price: totalPrice,
    };

    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    openPreparingModal("이 페이지는 준비중입니다.");
  },
};

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  cartUI.init();
  cartEmpty.init();
  cartCheckbox.init();
  deleteModal.init();
  loginModal.init();
  cartExistsModal.init();
  stockModal.init();
  orderButton.init();

  // 장바구니 데이터 로드
  cartData.loadCart();
});

// 외부에서 사용할 수 있도록 export
export { cartData, addToCart, loginModal, cartExistsModal, stockModal };
