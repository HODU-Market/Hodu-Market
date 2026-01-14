// cart.js

/**
 * 삭제 확인 모달 관리
 */
const deleteModal = {
  modal: null,
  targetItem: null,

  init() {
    this.modal = document.getElementById('deleteModal');
    if (!this.modal) return;

    const overlay = this.modal.querySelector('.modal__overlay');
    const closeBtn = this.modal.querySelector('.modal__close');
    const cancelBtn = this.modal.querySelector('.modal__btn--cancel');
    const confirmBtn = this.modal.querySelector('.modal__btn--confirm');

    // 닫기 이벤트
    overlay.addEventListener('click', () => this.close());
    closeBtn.addEventListener('click', () => this.close());
    cancelBtn.addEventListener('click', () => this.close());

    // 확인 버튼 클릭 시 삭제
    confirmBtn.addEventListener('click', () => this.confirmDelete());

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.hidden) {
        this.close();
      }
    });

    // 삭제 버튼 이벤트 등록
    this.bindDeleteButtons();
  },

  bindDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.cart-item__delete');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.targetItem = e.target.closest('.cart-item');
        this.open();
      });
    });
  },

  open() {
    this.modal.hidden = false;
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.modal.hidden = true;
    this.targetItem = null;
    document.body.style.overflow = '';
  },

  confirmDelete() {
    if (this.targetItem) {
      this.targetItem.remove();
    }
    this.close();
  }
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  deleteModal.init();
});
