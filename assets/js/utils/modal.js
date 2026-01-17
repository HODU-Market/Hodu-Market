/**
 * 공통 모달 관리 클래스
 *
 * 사용 예시:
 * const modal = new Modal('modal-id', {
 *   confirmCallback: async (state) => { ... },
 *   beforeOpen: (data, modal) => { ... }
 * });
 * modal.init();
 * modal.open({ key: value });
 */
export class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.modal = null;
    this.confirmCallback = options.confirmCallback || null;
    this.closeCallback = options.closeCallback || null;
    this.beforeOpen = options.beforeOpen || null;
    this.state = {};
    this.escapeHandler = null;
  }

  /**
   * 모달 초기화 - DOM 요소 찾기 및 이벤트 바인딩
   */
  init() {
    this.modal = document.getElementById(this.id);
    if (!this.modal) {
      console.warn(`Modal with id "${this.id}" not found`);
      return;
    }

    this._bindCloseEvents();
    this._bindConfirmEvent();
    this._bindEscapeKey();
  }

  /**
   * 모달 열기
   * @param {Object} data - 모달에 전달할 데이터 (state로 저장됨)
   */
  open(data = {}) {
    if (!this.modal) return;

    // 상태 저장 (deleteModal의 targetCartId 등)
    this.state = { ...data };

    // 동적 데이터 주입 (stockModal의 maxStock 등)
    if (this.beforeOpen) {
      this.beforeOpen(data, this.modal);
    }

    this.modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  /**
   * 모달 닫기
   */
  close() {
    if (!this.modal) return;

    this.modal.hidden = true;
    document.body.style.overflow = "";

    // 상태 초기화
    this.state = {};

    // 닫기 콜백 실행
    if (this.closeCallback) {
      this.closeCallback();
    }
  }

  /**
   * 확인 버튼 동작 (private)
   * async 지원 - deleteModal의 API 호출 등
   */
  async _confirm() {
    if (this.confirmCallback) {
      await this.confirmCallback(this.state);
    }
    this.close();
  }

  /**
   * 닫기 이벤트 바인딩 (overlay, X버튼, 취소)
   */
  _bindCloseEvents() {
    const overlay = this.modal.querySelector(".modal__overlay");
    const closeBtn = this.modal.querySelector(".modal__close");
    const cancelBtn = this.modal.querySelector(".modal__btn--cancel");

    overlay?.addEventListener("click", () => this.close());
    closeBtn?.addEventListener("click", () => this.close());
    cancelBtn?.addEventListener("click", () => this.close());
  }

  /**
   * 확인 버튼 이벤트 바인딩
   */
  _bindConfirmEvent() {
    const confirmBtn = this.modal.querySelector(".modal__btn--confirm");
    confirmBtn?.addEventListener("click", () => this._confirm());
  }

  /**
   * Escape 키 이벤트 바인딩
   */
  _bindEscapeKey() {
    this.escapeHandler = (e) => {
      if (e.key === "Escape" && this.modal && !this.modal.hidden) {
        this.close();
      }
    };
    document.addEventListener("keydown", this.escapeHandler);
  }

  /**
   * 메모리 정리 (필요시 호출)
   */
  destroy() {
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
  }
}
