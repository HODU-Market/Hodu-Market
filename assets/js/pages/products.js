import { fetchProductDetail } from "../api/products.js";

document.addEventListener("DOMContentLoaded", () => {
  initDetail();
  initTimer();
  initReviewStars();
  initTabs();
  initQuantityControls();
});

let unitPrice = 0;
let stock = 0;

async function initDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    renderDetailError("상품 정보를 찾을 수 없습니다.");
    return;
  }

  try {
    const data = await fetchProductDetail(id);
    renderDetail(data);
  } catch (err) {
    console.error("Failed to load product detail:", err);
    renderDetailError("상품 정보를 불러오지 못했습니다.");
  }
}

function renderDetail(product) {
  const imageEl = document.querySelector(".product-media img");
  const sellerEl = document.querySelector(".kicker");
  const titleEl = document.querySelector(".title");
  const priceEl = document.querySelector(".price");
  const descEl = document.getElementById("productDescription");
  const shippingLabelEl = document.querySelector(".row .label");
  const shippingValueEl = document.querySelector(".row .value");
  const qtyFieldset = document.querySelector(".qty-control");

  const price = Number(product?.price || 0);
  unitPrice = price;
  stock = Number(product?.stock || 0);

  if (imageEl) {
    imageEl.src = product?.image || "../assets/images/sample image.png";
    imageEl.alt = product?.name || "상품 이미지";
  }
  if (sellerEl) {
    sellerEl.textContent =
      product?.seller?.store_name ||
      product?.seller?.name ||
      product?.seller?.username ||
      "판매자";
  }
  if (titleEl) titleEl.textContent = product?.name || "상품명";
  if (priceEl) {
    priceEl.dataset.price = String(price);
    priceEl.textContent = formatPrice(price);
  }
  if (descEl) descEl.textContent = product?.info || "";
  if (shippingLabelEl) shippingLabelEl.textContent = formatShippingMethod(product?.shipping_method);
  if (shippingValueEl) shippingValueEl.textContent = formatShippingFee(product?.shipping_fee);
  if (qtyFieldset) qtyFieldset.dataset.stock = String(stock);

  updateResult();
}

function renderDetailError(message) {
  const titleEl = document.querySelector(".title");
  const descEl = document.getElementById("productDescription");

  if (titleEl) titleEl.textContent = message;
  if (descEl) descEl.textContent = "";
}

function formatPrice(value) {
  const n = Number(value || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function formatShippingMethod(value) {
  if (value === "DELIVERY") return "직접배송 /";
  return "택배배송 /";
}

function formatShippingFee(value) {
  const fee = Number(value || 0);
  return fee === 0 ? "무료배송" : formatPrice(fee);
}

function getQuantityElements() {
  const quantityInput =
    document.querySelector(".qty-control__input") ||
    document.querySelector(".quantity-input");
  const btnMinus =
    document.querySelector(".qty-control__btn--minus") ||
    document.querySelector(".btn-minus");
  const btnPlus =
    document.querySelector(".qty-control__btn--plus") ||
    document.querySelector(".btn-plus");
  const totalCount = document.querySelector(".total-count");
  const totalMoney = document.querySelector(".total-money");

  return { quantityInput, btnMinus, btnPlus, totalCount, totalMoney };
}

function initQuantityControls() {
  const { quantityInput, btnMinus, btnPlus } = getQuantityElements();

  if (!quantityInput || !btnMinus || !btnPlus) return;

  btnPlus.addEventListener("click", () => {
    const current = Number(quantityInput.value || 1);
    const next = current + 1;
    if (stock && next > stock) return;
    quantityInput.value = String(next);
    updateResult();
  });

  btnMinus.addEventListener("click", () => {
    const current = Number(quantityInput.value || 1);
    const next = Math.max(1, current - 1);
    quantityInput.value = String(next);
    updateResult();
  });

  updateResult();
}

function updateResult() {
  const { quantityInput, totalCount, totalMoney } = getQuantityElements();
  if (!quantityInput || !totalCount || !totalMoney) return;

  const count = Math.max(1, Number(quantityInput.value || 1));
  totalCount.textContent = String(count);
  totalMoney.textContent = formatPrice(unitPrice * count);
}

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

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const displayHours = String(hours).padStart(2, "0");
    const displayMinutes = String(minutes).padStart(2, "0");
    const displaySeconds = String(seconds).padStart(2, "0");

    timerElement.textContent = `${displayHours}:${displayMinutes}:${displaySeconds}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function initReviewStars() {
  const container = document.querySelector(".stars-container");
  if (!container) return;

  const score = parseFloat(container.dataset.score || "0");
  const stars = container.querySelectorAll(".star-svg");

  stars.forEach((star, index) => {
    if (index < Math.floor(score)) {
      star.classList.add("filled");
    } else {
      star.classList.remove("filled");
    }
  });
}

function initTabs() {
  const tabItems = document.querySelectorAll(".tab-item");
  const contentSections = document.querySelectorAll(".content-item");
  const tabNav = document.querySelector(".product-tabs");

  if (!tabItems.length || !contentSections.length || !tabNav) return;

  tabItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-tab");
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const navHeight = tabNav.offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: "-100px 0px -70% 0px",
    threshold: 0,
  };

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
  }, observerOptions);

  contentSections.forEach((section) => observer.observe(section));
}
