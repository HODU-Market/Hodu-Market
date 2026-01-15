// common.js

/**
 * 수량 조절 컴포넌트 초기화
 * - 버튼 클릭으로 수량 증감
 * - 재고 초과 시 + 버튼 비활성화
 * - 수량 1 이하 시 - 버튼 비활성화
 */
function initQtyControl() {
  const qtyControls = document.querySelectorAll('.qty-control');

  qtyControls.forEach((control) => {
    const minusBtn = control.querySelector('.qty-control__btn--minus');
    const plusBtn = control.querySelector('.qty-control__btn--plus');
    const input = control.querySelector('.qty-control__input');
    const stock = parseInt(control.dataset.stock, 10) || 0;

    // 초기 버튼 상태 설정
    updateButtonState(input, minusBtn, plusBtn, stock);

    // 감소 버튼 클릭
    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(input.value, 10) || 1;
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateButtonState(input, minusBtn, plusBtn, stock);
      }
    });

    // 증가 버튼 클릭
    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(input.value, 10) || 1;
      if (currentValue < stock) {
        input.value = currentValue + 1;
        updateButtonState(input, minusBtn, plusBtn, stock);
      }
    });
  });
}

/**
 * 버튼 활성화/비활성화 상태 업데이트
 */
function updateButtonState(input, minusBtn, plusBtn, stock) {
  const value = parseInt(input.value, 10) || 1;

  // 수량이 1이면 - 버튼 비활성화
  minusBtn.disabled = value <= 1;

  // 수량이 재고와 같거나 재고가 0이면 + 버튼 비활성화
  plusBtn.disabled = value >= stock || stock === 0;
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', initQtyControl);



// header, footer 공통 컴포넌트 로드
const headerSnippet = document.getElementById("header-snippet");
const footerSnippet = document.getElementById("footer-snippet");

if (headerSnippet) {
  fetch("../components/header.html")
    .then(response => response.text())
    .then(data => {
      headerSnippet.innerHTML = data;
      initHeaderUI();
    });
}

if (footerSnippet) {
  fetch("../components/footer.html")
    .then(response => response.text())
    .then(data => {
      footerSnippet.innerHTML = data;
    });
}

function initHeaderUI() {
  const mypage = document.querySelector(".mypage");
  const mypageBtn = document.querySelector(".mypage-btn");
  const dropdown = document.querySelector(".dropdown");

  if (!mypage || !mypageBtn || !dropdown) return;

  mypageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mypage.classList.toggle("is-open");
    mypageBtn.setAttribute(
      "aria-expanded",
      mypage.classList.contains("is-open")
    );
  });

  document.addEventListener("click", () => {
    mypage.classList.remove("is-open");
    mypageBtn.setAttribute("aria-expanded", "false");
  });

  dropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".dropdown-item");
    if (!btn) return;

    if (btn.dataset.action === "logout") {
      localStorage.clear();
      location.href = "../index.html";
    }
  });
}


