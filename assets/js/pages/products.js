import { fetchProductDetail } from "../api/products.js";

const IMAGE_FALLBACK = "../assets/images/sample image.png";

// 유틸리티 함수
function formatNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";
}

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("product_id");
}

document.addEventListener("DOMContentLoaded", () => {
    // DOM 요소 선택
    const priceElement = document.querySelector(".price");
    const titleElement = document.querySelector(".title");
    const kickerElement = document.querySelector(".kicker");
    const productImage = document.querySelector(".product-media img");
    const shippingLabel = document.querySelector(".row .label");
    const shippingValue = document.querySelector(".row .value");
    const qtyControl = document.querySelector(".qty-control");
    const quantityInput = document.querySelector(".qty-control__input");
    const totalCount = document.querySelector(".total-count");
    const totalMoney = document.querySelector(".total-money");
    const btnMinus = document.querySelector(".qty-control__btn--minus");
    const btnPlus = document.querySelector(".qty-control__btn--plus");
    const descriptionSection = document.getElementById("description");
    let descriptionElement = document.querySelector(".product-description");

    if (!descriptionElement && descriptionSection) {
        descriptionElement = document.createElement("p");
        descriptionElement.className = "product-description";
        descriptionSection.appendChild(descriptionElement);
    }

    let unitPrice = 0;
    let currentStock = 0;

    // --- 수량 및 가격 관리 함수 ---
    function updateResult() {
        if (!quantityInput || !totalCount || !totalMoney) return;
        const count = parseInt(quantityInput.value, 10) || 0;
        totalCount.textContent = count;
        totalMoney.textContent = formatNumber(unitPrice * count);
    }

    function updateQtyUI(nextValue) {
        if (!quantityInput || !btnMinus || !btnPlus) return;
        let value = Number.isFinite(nextValue) ? nextValue : parseInt(quantityInput.value, 10);
        
        if (currentStock === 0) {
            value = 0;
        } else {
            value = Math.min(Math.max(value, 1), currentStock);
        }

        quantityInput.value = String(value);
        btnMinus.disabled = currentStock === 0 || value <= 1;
        btnPlus.disabled = currentStock === 0 || value >= currentStock;
    }

    // --- 데이터 로딩 및 렌더링 ---
    async function loadProduct(id) {
        try {
            const product = await fetchProductDetail(id);
            renderProduct(product);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
            renderError("상품을 불러올 수 없습니다.");
        }
    }

    function renderProduct(product) {
        const name = product?.product_name || product?.name || "상품명";
        unitPrice = Number(product?.price ?? 0);
        currentStock = Number(product?.stock ?? 0);

        if (titleElement) titleElement.textContent = name;
        if (priceElement) {
            priceElement.textContent = formatNumber(unitPrice);
            priceElement.dataset.price = String(unitPrice);
        }
        if (productImage) {
            productImage.src = product?.image || IMAGE_FALLBACK;
            productImage.alt = name;
        }
        // ... 기타 렌더링 로직 생략 (기존 코드와 동일)
        
        updateQtyUI(currentStock > 0 ? 1 : 0);
        updateResult();
    }

    function renderError(message) {
        if (titleElement) titleElement.textContent = message;
        unitPrice = 0;
        currentStock = 0;
        updateResult();
    }

    // --- 타이머 기능 ---
    function startTimer() {
        const timerElement = document.getElementById("realtime-timer");
        if (!timerElement) return;

        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date().setHours(24, 0, 0, 0);
            const diff = midnight - now;

            if (diff <= 0) {
                timerElement.textContent = "00:00:00";
                return;
            }
            const hours = String(Math.floor((diff / 3600000) % 24)).padStart(2, "0");
            const mins = String(Math.floor((diff / 60000) % 60)).padStart(2, "0");
            const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
            timerElement.textContent = `${hours}:${mins}:${secs}`;
        };
        setInterval(updateTimer, 1000);
        updateTimer();
    }

    // --- 실행부 ---
    startTimer();
    
    // 수량 버튼 이벤트 바인딩
    btnPlus?.addEventListener("click", () => {
        updateQtyUI(parseInt(quantityInput.value) + 1);
        updateResult();
    });
    btnMinus?.addEventListener("click", () => {
        updateQtyUI(parseInt(quantityInput.value) - 1);
        updateResult();
    });

    const productId = getProductId();
    if (productId) {
        loadProduct(productId);
    }
});