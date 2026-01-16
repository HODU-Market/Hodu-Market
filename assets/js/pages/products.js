import { fetchProductDetail } from "../api/products.js";
import { addToCart } from "../api/cart.api.js";
import { tokenManager } from "../api/config.js";

const IMAGE_FALLBACK = "../assets/images/sample image.png";

/**
 * 로그인 모달 관리
 */
const loginModal = {
    modal: null,

    init() {
        this.modal = document.getElementById("loginModal");
        if (!this.modal) return;

        const overlay = this.modal.querySelector(".modal__overlay");
        const closeBtn = this.modal.querySelector(".modal__close");
        const cancelBtn = this.modal.querySelector(".modal__btn--cancel");
        const confirmBtn = this.modal.querySelector(".modal__btn--confirm");

        overlay?.addEventListener("click", () => this.close());
        closeBtn?.addEventListener("click", () => this.close());
        cancelBtn?.addEventListener("click", () => this.close());
        confirmBtn?.addEventListener("click", () => this.confirmLogin());

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modal && !this.modal.hidden) {
                this.close();
            }
        });
    },

    open() {
        if (!this.modal) return;
        this.modal.hidden = false;
        document.body.style.overflow = "hidden";
    },

    close() {
        if (!this.modal) return;
        this.modal.hidden = true;
        document.body.style.overflow = "";
    },

    confirmLogin() {
        this.close();
        window.location.href = "../join/login.html";
    },
};

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
    // 로그인 모달 초기화
    loginModal.init();

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
    const btnCart = document.querySelector(".btn-cart");
    const descriptionSection = document.getElementById("description");
    let descriptionElement = document.querySelector(".product-description");

    if (!descriptionElement && descriptionSection) {
        descriptionElement = document.createElement("p");
        descriptionElement.className = "product-description";
        descriptionSection.appendChild(descriptionElement);
    }

    let unitPrice = 0;
    let currentStock = 0;
    let activeProductId = null;

    function initScrollSpy() {
        const tabButtons = Array.from(document.querySelectorAll(".tab-item"));
        if (tabButtons.length === 0) return;

        const sections = tabButtons
            .map((btn) => document.getElementById(btn.dataset.tab))
            .filter(Boolean);
        if (sections.length === 0) return;

        const tabsBar = document.querySelector(".product-tabs");
        const getOffset = () => {
            if (!tabsBar) return 0;
            const top = Number.parseFloat(getComputedStyle(tabsBar).top) || 0;
            return tabsBar.offsetHeight + top;
        };

        const setActiveTab = (tabId) => {
            tabButtons.forEach((btn) => {
                btn.classList.toggle("active", btn.dataset.tab === tabId);
            });
        };

        tabButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const target = document.getElementById(btn.dataset.tab);
                if (!target) return;

                const offset = getOffset();
                const top = window.scrollY + target.getBoundingClientRect().top - offset - 8;
                window.scrollTo({ top, behavior: "smooth" });
                setActiveTab(btn.dataset.tab);
            });
        });

        let ticking = false;
        const updateActiveOnScroll = () => {
            const offset = getOffset();
            const scrollPos = window.scrollY + offset + 1;
            let currentId = sections[0].id;

            for (const section of sections) {
                if (scrollPos >= section.offsetTop) {
                    currentId = section.id;
                } else {
                    break;
                }
            }

            setActiveTab(currentId);
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                updateActiveOnScroll();
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        updateActiveOnScroll();
    }

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
        const sellerName =
            product?.seller?.store_name ||
            product?.seller?.name ||
            product?.seller?.username ||
            product?.seller_name ||
            product?.store_name ||
            "";
        unitPrice = Number(product?.price ?? 0);
        currentStock = Number(product?.stock ?? 0);
        activeProductId = product?.id ?? activeProductId;

        if (kickerElement) kickerElement.textContent = sellerName || "판매점";
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
        
        if (shippingLabel) shippingLabel.textContent = "택배배송 / ";
    if (shippingValue) shippingValue.textContent = "무료배송";
    if (qtyControl) qtyControl.dataset.stock = String(product?.stock ?? 0);


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
    initScrollSpy();
    
    // 수량 버튼 이벤트 바인딩
    btnPlus?.addEventListener("click", () => {
        updateQtyUI(parseInt(quantityInput.value) + 1);
        updateResult();
    });
    btnMinus?.addEventListener("click", () => {
        updateQtyUI(parseInt(quantityInput.value) - 1);
        updateResult();
    });

    btnCart?.addEventListener("click", async () => {
        const quantity = parseInt(quantityInput?.value, 10) || 0;
        const productId = activeProductId ?? getProductId();

        if (!productId) {
            alert("상품 정보를 확인할 수 없습니다.");
            return;
        }

        if (quantity < 1) {
            alert("수량을 선택해주세요.");
            return;
        }

        if (!tokenManager.isLoggedIn()) {
            loginModal.open();
            return;
        }

        if (!tokenManager.isBuyer()) {
            alert("구매자만 장바구니를 이용할 수 있습니다.");
            return;
        }

        try {
            await addToCart(productId, quantity);
            alert("장바구니에 담았습니다.");
        } catch (error) {
            console.error("장바구니 추가 실패:", error);
            alert(error?.message || "장바구니 추가에 실패했습니다.");
        }
    });

    const productId = getProductId();
    if (productId) {
        activeProductId = productId;
        loadProduct(productId);
    }
});
