// cart.js

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

    // 초기 상태 체크
    this.checkEmpty();
  },

  // cart.js의 checkEmpty 함수 수정
  checkEmpty() {
    const items = document.querySelectorAll(".cart-item");
    const isEmpty = items.length === 0;

    const toggleElement = (el, shouldHide) => {
      if (!el) return;
      if (shouldHide) {
        el.classList.add("is-hidden"); // 클래스 추가로 숨김
      } else {
        el.classList.remove("is-hidden"); // 클래스 제거로 노출
      }
    };

    // 1. 빈 상태 메시지
    toggleElement(this.emptyState, !isEmpty);

    // 2. 상품 목록
    toggleElement(this.cartList, isEmpty);

    // 3. 결제 금액 요약
    toggleElement(this.cartSummary, isEmpty);

    // 4. 주문하기 버튼
    toggleElement(this.orderBtn, isEmpty);

    // 5. 전체 선택 체크박스 비활성화
    if (this.selectAll) {
      this.selectAll.disabled = isEmpty;
      this.selectAll.checked = false;
    }
  },
};

/**
 * 체크박스 관리 (전체 선택/개별 선택)
 */
const cartCheckbox = {
  selectAll: null,
  itemCheckboxes: null,

  init() {
    this.selectAll = document.getElementById("select-all");
    this.itemCheckboxes = document.querySelectorAll('input[name="cart-item"]');

    if (!this.selectAll) return;

    // 전체 선택 체크박스 이벤트
    this.selectAll.addEventListener("change", () => this.handleSelectAll());

    // 개별 체크박스 이벤트
    this.itemCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.updateSelectAll());
    });
  },

  // 전체 선택/해제
  handleSelectAll() {
    const isChecked = this.selectAll.checked;
    this.itemCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  },

  // 개별 체크박스 변경 시 전체 선택 상태 업데이트
  updateSelectAll() {
    const total = this.itemCheckboxes.length;
    const checked = Array.from(this.itemCheckboxes).filter(
      (cb) => cb.checked
    ).length;

    if (total === 0) {
      this.selectAll.checked = false;
      this.selectAll.indeterminate = false;
    } else {
      this.selectAll.checked = total === checked;
      this.selectAll.indeterminate = checked > 0 && checked < total;
    }
  },

  // 체크박스 목록 갱신 (상품 삭제 후 호출)
  refresh() {
    this.itemCheckboxes = document.querySelectorAll('input[name="cart-item"]');
    this.updateSelectAll();
  },
};

/**
 * 삭제 확인 모달 관리
 */
const deleteModal = {
  modal: null,
  targetItem: null,

  init() {
    this.modal = document.getElementById("deleteModal");

    // 모달이 없으면 삭제 버튼만 바인딩 (바로 삭제)
    if (!this.modal) {
      this.bindDeleteButtons(false);
      return;
    }

    const overlay = this.modal.querySelector(".modal__overlay");
    const closeBtn = this.modal.querySelector(".modal__close");
    const cancelBtn = this.modal.querySelector(".modal__btn--cancel");
    const confirmBtn = this.modal.querySelector(".modal__btn--confirm");

    // 닫기 이벤트
    overlay.addEventListener("click", () => this.close());
    closeBtn.addEventListener("click", () => this.close());
    cancelBtn.addEventListener("click", () => this.close());

    // 확인 버튼 클릭 시 삭제
    confirmBtn.addEventListener("click", () => this.confirmDelete());

    // ESC 키로 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hidden) {
        this.close();
      }
    });

    // 삭제 버튼 이벤트 등록
    this.bindDeleteButtons(true);
  },

  bindDeleteButtons(useModal) {
    const deleteButtons = document.querySelectorAll(".cart-item__delete");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.targetItem = e.target.closest(".cart-item");
        if (useModal) {
          this.open();
        } else {
          // 모달 없이 바로 삭제
          this.confirmDelete();
        }
      });
    });
  },

  open() {
    this.modal.hidden = false;
    document.body.style.overflow = "hidden";
  },

  close() {
    this.modal.hidden = true;
    this.targetItem = null;
    document.body.style.overflow = "";
  },

  confirmDelete() {
    if (this.targetItem) {
      this.targetItem.remove();
      // 체크박스 상태 갱신
      cartCheckbox.refresh();
      // 빈 상태 체크
      cartEmpty.checkEmpty();
    }
    if (this.modal) {
      this.close();
    }
  },
};

// DOM 로드 완료 후 초기화
document.addEventListener("DOMContentLoaded", () => {
  cartEmpty.init();
  cartCheckbox.init();
  deleteModal.init();
});
