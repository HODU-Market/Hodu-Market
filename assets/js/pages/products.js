import { fetchProductDetail } from "../api/products.api.js";

    const IMAGE_FALLBACK = "../assets/images/sample image.png";

    function formatNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return "0";
    }
    return n.toLocaleString("ko-KR");
    }

    function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("product_id");
    }

    document.addEventListener("DOMContentLoaded", () => {
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

    let unitPrice = priceElement ? parseInt(priceElement.dataset.price, 10) || 0 : 0;
    let currentStock = 0;

    function updateResult() {
        if (!quantityInput || !totalCount || !totalMoney) {
        return;
        }
        const count = Math.max(parseInt(quantityInput.value, 10) || 0, 0);
        totalCount.textContent = count;
        totalMoney.textContent = formatNumber(unitPrice * count);
    }

    function normalizeStock(value) {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }

    function updateQtyUI(nextValue) {
        if (!quantityInput || !btnMinus || !btnPlus) {
        return;
        }

        const safeStock = currentStock;
        let value = Number.isFinite(nextValue)
        ? nextValue
        : parseInt(quantityInput.value, 10);

        if (!Number.isFinite(value)) {
        value = safeStock > 0 ? 1 : 0;
        }

        if (safeStock === 0) {
        value = 0;
        } else {
        value = Math.min(Math.max(value, 1), safeStock);
        }

        quantityInput.value = String(value);
        quantityInput.min = safeStock > 0 ? "1" : "0";
        quantityInput.max = String(safeStock);

        btnMinus.disabled = safeStock === 0 ? true : value <= 1;
        btnPlus.disabled = safeStock === 0 ? true : value >= safeStock;
    }

    function setQuantity(nextValue) {
        updateQtyUI(nextValue);
        updateResult();
    }

    function setStock(stock) {
        currentStock = normalizeStock(stock);
        if (qtyControl) {
        qtyControl.dataset.stock = String(currentStock);
        }
        updateQtyUI();
    }

    function bindQtyHandlers() {
        if (!quantityInput || !btnMinus || !btnPlus) {
        return;
        }

        btnMinus.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const currentValue = parseInt(quantityInput.value, 10) || 0;
            setQuantity(currentValue - 1);
        },
        { capture: true }
        );

        btnPlus.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const currentValue = parseInt(quantityInput.value, 10) || 0;
            setQuantity(currentValue + 1);
        },
        { capture: true }
        );
    }

    function startTimer() {
        const timerElement = document.getElementById("realtime-timer");
        if (!timerElement) {
        return;
        }

        function updateTimer() {
        const now = new Date();

        // 오늘 자정 시간 설정
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        // 남은 시간 계산 (밀리초 단위)
        const diff = midnight - now;

        if (diff <= 0) {
            timerElement.textContent = "00:00:00";
            return;
        }

        // 시, 분, 초 계산
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        // 두 자리 수 형식으로 맞춤 (예: 05:09:01)
        const displayHours = String(hours).padStart(2, "0");
        const displayMinutes = String(minutes).padStart(2, "0");
        const displaySeconds = String(seconds).padStart(2, "0");

        timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
        }

        // 초기 실행 후 1초마다 반복 실행
        updateTimer();
        setInterval(updateTimer, 1000);
      }});

function initTimer() {
  const timerElement = document.getElementById("realtime-timer");
  if (!timerElement) return;

  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;

    if (diff <= 0) {
      timerElement.textContent = "00:00:00";
      return;
    }

    function renderProduct(product) {
        const name = product?.name || "상품명";
    const sellerName =
      product?.seller?.store_name ||
      product?.seller?.name ||
      product?.seller?.username ||
      "판매자";
        const price = Number(product?.price ?? 0);
        const shippingFee = Number(product?.shipping_fee ?? 0);
        const stock = Number(product?.stock ?? 0);

        unitPrice = Number.isFinite(price) ? price : 0;

        if (titleElement) {
        titleElement.textContent = name;
        }

        if (kickerElement) {
        kickerElement.textContent = sellerName;
        }

        if (priceElement) {
        priceElement.textContent = formatNumber(unitPrice);
        priceElement.dataset.price = String(unitPrice);
        }

        if (productImage) {
        productImage.src = product?.image || IMAGE_FALLBACK;
        productImage.alt = name;
        }

        const shippingMethodText = product?.shipping_method === "DELIVERY" ? "직접배송" : "택배배송";
        const shippingFeeText = shippingFee === 0 ? "무료배송" : `${formatNumber(shippingFee)}원`;

        if (shippingLabel) {
        shippingLabel.textContent = `${shippingMethodText} /`;
        }

        if (shippingValue) {
        shippingValue.textContent = shippingFeeText;
        }

        setStock(stock);

        if (descriptionElement) {
        descriptionElement.textContent = product?.info || "상품 설명이 없습니다.";
        }

        document.title = `${name} - 호두마켓`;
        updateResult();
    }

    function renderError(message) {
        unitPrice = 0;
        if (titleElement) {
        titleElement.textContent = message;
        }

        if (priceElement) {
        priceElement.textContent = "0";
        priceElement.dataset.price = "0";
        }

        if (descriptionElement) {
        descriptionElement.textContent = "상품 정보를 불러오지 못했습니다.";
        }

        setStock(0);
        updateResult();
    }

    startTimer();
    setStock(qtyControl?.dataset.stock);
    updateResult();
    bindQtyHandlers();

    const productId = getProductId();
    if (productId) {
        loadProduct(productId);
    } else {
        renderError("상품 정보를 찾을 수 없습니다.");
    }

    const tabItems = document.querySelectorAll(".tab-item");
    const contentSections = document.querySelectorAll(".content-item");
    const tabNav = document.querySelector(".product-tabs");

    if (tabItems.length && contentSections.length && tabNav) {
        tabItems.forEach((item) => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-tab");
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
            // 상단 고정된 탭 메뉴의 높이 측정
            const navHeight = tabNav.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth",
            });
            }
        });
        });
    }

  const observerOptions = {
    root: null,
    rootMargin: "-100px 0px -70% 0px",
    threshold: 0,
  };

    if (!contentSections.length || !tabItems.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");

            tabItems.forEach((btn) => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-tab") === id) {
                btn.classList.add("active");
            }
            });
        }
        });
      })}};

  contentSections.forEach((section) => observer.observe(section));
