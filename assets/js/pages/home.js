// assets/js/pages/home.js
import { fetchProducts } from "../api/products.js";

let allProducts = [];
let productsRendered = false;

// pagination / search state
let nextUrl = null;
let currentSearch = "";
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    showLoggedOutView();
    return;
  }

  initBannerSwiper();
  initHeaderUI();
  initSearchUI();
  initLoadMoreUI();
  initProductsOnce();
});

function isLoggedIn() {
  return Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
  );
}

function showLoggedOutView() {
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");

  if (header) header.hidden = true;
  if (main) main.hidden = true;
  if (footer) footer.hidden = true;
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

  // submit = 검색 실행
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();

    currentSearch = q;
    nextUrl = null;

    try {
      await loadProducts({ reset: true });
    } catch (err) {
      console.error("검색 실패:", err);
    }
  });

  // 아이콘 클릭 시 포커스만
  icon.addEventListener("click", () => input.focus());
}

function initLoadMoreUI() {
  const btn = document.getElementById("btnLoadMore");
  if (!btn) return;

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

  // “로그인 하면 불러오기” 대응:
  // 토큰이 있는 경우(로그인 상태)면 즉시 API 로드 시도.
  // 토큰이 없어도 공개 API면 정상 로드되므로, 일단 시도하되 실패하면 샘플 유지.
  try {
    currentSearch = "";
    nextUrl = null;

    await loadProducts({ reset: true });
    productsRendered = true;
  } catch (err) {
    console.error("상품 로드 실패(샘플 유지):", err);
    // 실패 시: 기존 HTML 샘플 목록 유지, emptyState는 건드리지 않음
  }
  window.history.replaceState({}, "", url);
}

/**
 * 핵심 로더:
 * - reset=true: 첫 페이지 로드 + 기존(샘플)목록은 "성공 후" 교체
 * - reset=false: nextUrl 있으면 다음 페이지 append
 */
async function loadProducts({ reset } = { reset: false }) {
  if (isLoading) return;
  isLoading = true;

  const list = document.getElementById("productList");
  const emptyEl = document.getElementById("emptyState");
  const moreBtn = document.getElementById("btnLoadMore");

  if (!list) {
    isLoading = false;
    return;
  }

  // 현재 샘플(정적) 목록이 있는지 여부
  const hasStaticItems = list.children.length > 0 && !list.dataset.hydrated;

  try {
    // fetchProducts 호출 규칙:
    // - nextUrl이 있으면 그 URL로 다음 페이지
    // - nextUrl이 없으면 search 파라미터로 첫 페이지
    const data = await fetchProducts({
      nextUrl: reset ? null : nextUrl,
      search: reset ? currentSearch : "",
    });

    const results = data?.results || [];
    nextUrl = data?.next || null;

    if (reset) {
      // reset일 때만 allProducts를 새로 구성
      allProducts = [...results];

      // “원래 메인페이지 상품목록 유지”:
      // API 성공 전에는 샘플 유지, 성공했으니 여기서 교체
      renderProducts(results, { append: false });
      list.dataset.hydrated = "true";
    } else {
      // 더보기 = append
      allProducts.push(...results);
      renderProducts(results, { append: true });
      list.dataset.hydrated = "true";
    }

    // empty state
    if (emptyEl) {
      const isEmpty = allProducts.length === 0;
      emptyEl.hidden = !isEmpty;
    }

    // 더보기 버튼
    if (moreBtn) {
      moreBtn.hidden = !nextUrl;
    }
  } catch (err) {
    // reset 상황에서도, 기존 샘플이 있다면 유지해야 함
    if (reset && hasStaticItems) {
      // 샘플 유지(아무 것도 변경하지 않음)
      if (moreBtn) moreBtn.hidden = true;
      if (emptyEl) emptyEl.hidden = true;
      throw err;
    }

    // 샘플이 없거나 이미 hydrated 된 이후 실패면 empty 처리
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
  const list = document.getElementById("productList");
  if (!list) return;

  const html = (products || [])
    .map((p) => {
      const id = encodeURIComponent(p.id);
      const seller = p.seller?.store_name || p.seller?.name || "판매자";
      const img = p.image || "../assets/images/sample image.png";

      return `
        <li>
          <a class="product-card" href="../products/product.html?id=${id}">
            <div class="thumb">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}">
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

  if (append) {
    list.insertAdjacentHTML("beforeend", html);
  } else {
    list.innerHTML = html;
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
} 
