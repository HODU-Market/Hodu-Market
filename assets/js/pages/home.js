import { fetchProducts } from "../api/products.js";

let allProducts = [];
let productsRendered = false;

let nextUrl = null;
let currentSearch = "";
let isLoading = false;
let currentPage = 1;
let pageSize = null;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", () => {
  currentPage = getPageFromQuery();
  initBannerSwiper();
  renderHeaderByAuth();
  initHeaderUI();
  initLoginModal();
  updateHeaderForAuthState();
  initSearchUI();
  initLoadMoreUI();
  initPaginationUI();
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

function openPreparingModal(message = "이 페이지는 준비중입니다.") {
  if (document.getElementById("preparing-modal")) return;

  const modal = document.createElement("section");
  modal.className = "modal";
  modal.id = "preparing-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  modal.innerHTML = `
    <div class="modal__overlay" data-close="true"></div>
    <div class="modal__content modal--login">
      <button type="button" class="modal__close" aria-label="닫기" data-close="true"></button>
      <p class="modal__message">${message}</p>
      <div class="modal__actions">
        <button type="button" class="modal__btn modal__btn--confirm" data-close="true">확인</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") {
      modal.remove();
    }
  });

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", onKeyDown);
    }
  };
  document.addEventListener("keydown", onKeyDown);
}

function getUserInfo() {
  const raw = localStorage.getItem("user_info");
  return raw ? JSON.parse(raw) : null;
}

function isBuyer() {
  return getUserInfo()?.user_type === "BUYER";
}

function renderHeaderByAuth() {
  const navList = document.querySelector(".nav-list");
  if (!navList) return;

  if (!isLoggedIn()) {
    navList.classList.remove("nav-list--seller");
    navList.innerHTML = `
      <li class="header-cart">
        <a href="../cart/shopcart.html" class="header-cart-link">
          <img
            class="shopping-icon"
            src="../assets/images/icons/icon-shopping-cart.svg"
            alt=""
          />
          <span>장바구니</span>
        </a>
      </li>

      <li class="mypage">
        <button type="button" class="mypage-btn" aria-label="로그인">
          <img class="user-icon" src="../assets/images/icons/icon-user.svg" alt="">
          <span>로그인</span>
        </button>
      </li>
    `;

    const loginBtn = navList.querySelector(".mypage-btn");
    loginBtn?.addEventListener("click", () => {
      location.href = "../join/login.html";
    });
    return;
  }

  if (!isBuyer()) {
    navList.classList.add("nav-list--seller");
    navList.innerHTML = `
      <li class="mypage">
        <button type="button" class="mypage-btn" aria-haspopup="true" aria-expanded="false">
          <img class="user-icon" src="../assets/images/icons/icon-user.svg" alt="">
          <span>마이페이지</span>
        </button>

        <div class="dropdown" role="menu" aria-label="마이페이지 메뉴">
          <button type="button" class="dropdown-item" data-action="ui-only">마이페이지</button>
          <button type="button" class="dropdown-item" data-action="logout">로그아웃</button>
        </div>
      </li>
      <li class="seller-center">
        <a href="../seller/seller-product.html" class="seller-btn">
          <img src="../assets/images/icons/icon-shopping-bag.svg" alt="" class="seller-btn__icon">
          <span class="seller-btn__text">판매자 센터</span>
        </a>
      </li>
    `;
    return;
  }

  navList.classList.remove("nav-list--seller");
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

function getPaginationEl() {
  return (
    document.getElementById("pagination") ||
    document.querySelector("[data-role='pagination']")
  );
}

function getPageFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("page");
  const page = Number.parseInt(raw, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function setPageInUrl(page, { replace = false } = {}) {
  const url = new URL(window.location.href);
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");

  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
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

    if (btn.dataset.action === "ui-only") {
      openPreparingModal("이 페이지는 준비중입니다.");
      return;
    }

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
    currentPage = 1;
    pageSize = null;
    totalPages = 1;
    setPageInUrl(currentPage, { replace: true });

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

function initPaginationUI() {
  const pagination = getPaginationEl();
  if (!pagination) return;
  if (pagination.dataset.bound === "true") return;
  pagination.dataset.bound = "true";

  pagination.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn) return;
    if (btn.disabled) return;
    const nextPage = Number.parseInt(btn.dataset.page, 10);
    if (!Number.isFinite(nextPage) || nextPage < 1) return;
    if (nextPage === currentPage) return;

    currentPage = nextPage;
    setPageInUrl(currentPage);

    try {
      await loadProducts({ reset: true, scrollTop: true });
    } catch (err) {
      console.error("페이지 이동 실패:", err);
    }
  });

  window.addEventListener("popstate", async () => {
    const nextPage = getPageFromQuery();
    if (nextPage === currentPage) return;
    currentPage = nextPage;

    try {
      await loadProducts({ reset: true, scrollTop: true });
    } catch (err) {
      console.error("페이지 이동 실패:", err);
    }
  });
}

async function initProductsOnce() {
  if (productsRendered) return;

  try {
    currentSearch = "";
    nextUrl = null;

    setPageInUrl(currentPage, { replace: true });
    await loadProducts({ reset: true });
    productsRendered = true;
  } catch (err) {
    console.error("상품 로드 실패(샘플 유지):", err);
  }
}

async function loadProducts({ reset, scrollTop = false } = { reset: false }) {
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
      page: currentPage,
    });

    console.log("[products] response:", data);

    const results = data?.results || [];
    nextUrl = data?.next || null;
    const count = typeof data?.count === "number" ? data.count : null;
    const hasNext = Boolean(data?.next);
    const hasPrevious = Boolean(data?.previous);

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

    updatePagination({
      count,
      hasNext,
      hasPrevious,
      resultsLength: results.length,
    });

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

function updatePagination({
  count,
  hasNext,
  hasPrevious,
  resultsLength,
}) {
  const pagination = getPaginationEl();
  if (!pagination) return;

  if (!count || count <= 0) {
    pagination.hidden = true;
    return;
  }

  if (!pageSize && resultsLength > 0) {
    if (!hasNext && hasPrevious) {
      const inferred = (count - resultsLength) / (currentPage - 1);
      if (Number.isFinite(inferred) && Math.abs(inferred - Math.round(inferred)) < 0.001) {
        pageSize = Math.round(inferred);
      }
    } else {
      pageSize = resultsLength;
    }
  }

  if (!pageSize) {
    pagination.hidden = true;
    return;
  }

  totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) {
    pagination.hidden = true;
    return;
  }

  if (currentPage > totalPages) {
    currentPage = totalPages;
    setPageInUrl(currentPage, { replace: true });
  }

  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(totalPages, currentPage + halfWindow);

  if (endPage - startPage + 1 < windowSize) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + windowSize - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - windowSize + 1);
    }
  }

  const buttons = [];
  const pushNavButton = (label, page, disabled = false) => {
    buttons.push(`
      <button
        type="button"
        class="page-btn page-btn--nav"
        data-page="${page}"
        aria-label="${label}"
        ${disabled ? "disabled" : ""}
      >
        ${label}
      </button>
    `);
  };

  const pushPageButton = (page) => {
    const isActive = page === currentPage;
    buttons.push(`
      <button
        type="button"
        class="page-btn${isActive ? " is-active" : ""}"
        data-page="${page}"
        aria-current="${isActive ? "page" : "false"}"
        ${isActive ? "disabled" : ""}
      >
        ${page}
      </button>
    `);
  };

  const pushEllipsis = () => {
    buttons.push('<span class="page-ellipsis" aria-hidden="true">...</span>');
  };

  pushNavButton("‹", Math.max(1, currentPage - 1), currentPage === 1);

  pushPageButton(1);
  if (startPage > 2) pushEllipsis();

  for (let page = startPage; page <= endPage; page += 1) {
    if (page !== 1 && page !== totalPages) pushPageButton(page);
  }

  if (endPage < totalPages - 1) pushEllipsis();
  if (totalPages > 1) pushPageButton(totalPages);

  pushNavButton("›", Math.min(totalPages, currentPage + 1), currentPage === totalPages);

  const pageButtons = buttons.join("");

  pagination.innerHTML = pageButtons;
  pagination.hidden = false;
}

function renderProducts(products, { append } = { append: false }) {
  const list = getProductListEl();
  if (!list) return;

  const html = (products || [])
    .map((p) => {
      const id = encodeURIComponent(p.id);
      const seller = p.seller?.store_name || p.seller?.name || "판매자";
      const img = p.image || "../assets/images/sample-image.png";

      return `
        <li>
          <a class="product-card" href="./products/product.html?id=${id}">
            <div class="thumb">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" loading="lazy">
            </div>
            <div class="meta">
              <p class="seller">${escapeHtml(seller)}</p>
              <p class="name">${escapeHtml(p.name)}</p>
              <p class="price">
                <span class="price-number">${Number(p.price).toLocaleString()}</span>
                <span class="price-currency">원</span>
              </p>
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
