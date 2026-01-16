import { fetchProducts } from "../api/products.js";

let allProducts = [];
let productsRendered = false;

let nextUrl = null;
let currentSearch = "";
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  initBannerSwiper();
  renderHeaderByAuth();
  initHeaderUI();
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
        <a href="../seller/index.html" class="seller-btn">
          <img src="../assets/images/icons/icon-shopping-bag.svg" alt="" class="seller-btn__icon">
          <span class="seller-btn__text">판매자 센터</span>
        </a>
      </li>
    `;
    const sellerBtn = navList.querySelector(".seller-btn");
    sellerBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      openPreparingModal("이 페이지는 준비중입니다.");
    });
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

function showLoggedOutView() {
  const main = document.querySelector("main");
  if (!main) return;

  main.innerHTML = `
    <section class="login-required">
      <p class="login-required-text">로그인이 필요합니다.</p>
    </section>
  `;
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

    if (btn.dataset.action === "ui-only") {
      openPreparingModal("이 페이지는 준비중입니다.");
      return;
    }

    if (btn.dataset.action === "logout") {
      localStorage.clear();
      showLoggedOutView();
      location.href = "../index.html";
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
