import { fetchProducts } from "../api/products.js";

let allProducts = [];
let productsRendered = false;

let nextUrl = null;
let currentSearch = "";
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  initBannerSwiper();
  initHeaderUI();
  initLoginModal();
  updateHeaderForAuthState();
  initSearchUI();
  initLoadMoreUI();
  initProductsOnce();
});

function isLoggedIn() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("refresh") ||
    localStorage.getItem("refresh_token");

  return Boolean(token);
}

function getProductListEl() {
  return (
    document.getElementById("productList") ||
    document.getElementById("product-list") ||
    document.querySelector(".product-grid")
  );
}

function getLoadMoreBtnEl() {
  return (
    document.getElementById("btnLoadMore") ||
    document.getElementById("btn-load-more") ||
    document.querySelector("[data-role='load-more']")
  );
}

function getEmptyEl() {
  return (
    document.getElementById("emptyState") ||
    document.querySelector(".empty") ||
    document.querySelector("[data-role='empty']")
  );
}

/**
 * 로그인 상태에 따라 헤더 UI 업데이트
 */
function updateHeaderForAuthState() {
  const dropdown = document.querySelector(".dropdown");
  const logoutBtn = dropdown?.querySelector('[data-action="logout"]');
  const mypageBtn = dropdown?.querySelector('[data-action="ui-only"]');

  if (isLoggedIn()) {
    if (logoutBtn) logoutBtn.style.display = "";
    if (mypageBtn) mypageBtn.textContent = "마이페이지";
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (mypageBtn) mypageBtn.textContent = "로그인";
  }
}

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
    window.location.href = "./join/login.html";
  },
};

function initLoginModal() {
  loginModal.init();
}

function initBannerSwiper() {
  const el = document.querySelector(".banner-swiper");
  if (!el || typeof Swiper === "undefined") return;

  new Swiper(el, {
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    pagination: { el: ".swiper-pagination", clickable: true },
  });
}

function initHeaderUI() {
  const mypage = document.querySelector(".mypage");
  const mypageBtn = document.querySelector(".mypage-btn");
  const dropdown = document.querySelector(".dropdown");
  const cartLink = document.querySelector(".header-cart-link");

  if (!mypage || !mypageBtn || !dropdown) return;

  // 장바구니 클릭 시 로그인 체크
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      if (!isLoggedIn()) {
        e.preventDefault();
        loginModal.open();
      }
    });
  }

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
      updateHeaderForAuthState();
      location.href = "./index.html";
    }

    // 비로그인 상태에서 "로그인" 버튼 클릭 시
    if (btn.dataset.action === "ui-only" && !isLoggedIn()) {
      window.location.href = "./join/login.html";
    }
  });
}

function initSearchUI() {
  const form = document.querySelector(".input-box");
  const input = document.querySelector("#fieldInput");
  const icon = document.querySelector(".search-icon");

  if (!form || !input || !icon) return;
  if (form.dataset.bound === "true") return;
  form.dataset.bound = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    currentSearch = input.value.trim();
    nextUrl = null;

    try {
      await loadProducts({ reset: true });
    } catch (err) {
      console.error("검색 실패:", err);
    }
  });

  icon.addEventListener("click", () => input.focus());
}

function initLoadMoreUI() {
  const btn = getLoadMoreBtnEl();
  if (!btn) return;
  if (btn.dataset.bound === "true") return;
  btn.dataset.bound = "true";

  btn.addEventListener("click", async () => {
    try {
      await loadProducts({ reset: false });
    } catch (err) {
      console.error("더보기 실패:", err);
    }
  });
}

async function initProductsOnce() {
  if (productsRendered) return;

  try {
    currentSearch = "";
    nextUrl = null;

    await loadProducts({ reset: true });
    productsRendered = true;
  } catch (err) {
    console.error("상품 로드 실패(샘플 유지):", err);
  }
}

async function loadProducts({ reset } = { reset: false }) {
  if (isLoading) return;
  isLoading = true;

  const list = getProductListEl();
  const emptyEl = getEmptyEl();
  const moreBtn = getLoadMoreBtnEl();

  if (!list) {
    isLoading = false;
    console.error("상품 리스트 DOM을 찾지 못했습니다. #productList 또는 .product-grid 확인 필요");
    alert("상품 리스트 DOM을 찾지 못했습니다. HTML에서 productList 또는 product-grid를 확인하세요.");
    return;
  }

  const hasStaticItems = list.children.length > 0 && !list.dataset.hydrated;

  try {
    console.log("[products] request:", {
      reset,
      nextUrlParam: reset ? null : nextUrl,
      searchParam: reset ? currentSearch : "",
    });

    const data = await fetchProducts({
      nextUrl: reset ? null : nextUrl,
      search: reset ? currentSearch : "",
    });

    console.log("[products] response:", data);

    const results = data?.results || [];
    nextUrl = data?.next || null;

    console.log("[products] results length:", results.length);

    if (reset) {
      allProducts = [...results];
      renderProducts(results, { append: false });
      list.dataset.hydrated = "true";
      nextUrl = null;
    } else {
      allProducts.push(...results);
      renderProducts(results, { append: true });
    }    

    if (emptyEl) emptyEl.hidden = allProducts.length !== 0;
    if (moreBtn) moreBtn.hidden = true;
  } catch (err) {
    console.error("[products] fetch failed:", err);
    alert(err?.payload?.detail || err?.message || "상품 API 호출 실패");

    if (reset && hasStaticItems) {
      if (moreBtn) moreBtn.hidden = true;
      if (emptyEl) emptyEl.hidden = true;
      throw err;
    }

    if (reset) {
      allProducts = [];
      if (emptyEl) emptyEl.hidden = false;
      if (moreBtn) moreBtn.hidden = true;
    }

    throw err;
  } finally {
    isLoading = false;
  }
}

function renderProducts(products, { append } = { append: false }) {
  const list = getProductListEl();
  if (!list) return;

  const html = (products || [])
    .map((p) => {
      const id = encodeURIComponent(p.id);
      const seller = p.seller?.store_name || p.seller?.name || "판매자";
      const img = p.image || "../assets/images/sample image.png";

      return `
        <li>
          <a class="product-card" href="./products/product.html?id=${id}">
            <div class="thumb">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy">
            </div>
            <div class="meta">
              <p class="seller">${escapeHtml(seller)}</p>
              <p class="name">${escapeHtml(p.name)}</p>
              <p class="price">${Number(p.price).toLocaleString()}원</p>
            </div>
          </a>
        </li>
      `;
    })
    .join("");

  if (append) list.insertAdjacentHTML("beforeend", html);
  else list.innerHTML = html;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
