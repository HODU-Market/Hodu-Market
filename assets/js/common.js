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

fetch("../components/header.html")
.then(response => response.text())
.then(data => {
    document.getElementById("header-snippet").innerHTML = data;
});

fetch("../components/footer.html")
.then(response => response.text())
.then(data => {
    document.getElementById("footer-snippet").innerHTML = data;
});


