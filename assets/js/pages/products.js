document.addEventListener('DOMContentLoaded', () => {
    const priceElement = document.querySelector('.price');
    const unitPrice = parseInt(priceElement.dataset.price);
    
    const quantityInput = document.querySelector('.quantity-input');
    const totalCount = document.querySelector('.total-count');
    const totalMoney = document.querySelector('.total-money');

    const btnMinus = document.querySelector('.btn-minus');
    const btnPlus = document.querySelector('.btn-plus');

    // 화면 업데이트 함수
    function updateResult() {
        const count = parseInt(quantityInput.value);
        totalCount.textContent = count;
        totalMoney.textContent = (unitPrice * count).toLocaleString();
    }

    // 플러스 버튼
    btnPlus.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateResult();
    });

    // 마이너스 버튼
    btnMinus.addEventListener('click', () => {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            updateResult();
        }
    });

    // 탭 전환
    const tabItems = document.querySelectorAll('.tab-item');
    const contentItem = document.querySelector('.content-item');

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            tabItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            
            contentItem.textContent = `${item.textContent}의 상세 내용입니다.`;
        });
    });
});