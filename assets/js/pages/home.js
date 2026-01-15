// assets/js/pages/home.js
import { fetchProducts } from "../api/products.js";

let allProducts = [];
let productsRendered = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    applyLoggedOutLayout();
    return;
  }

  initBannerSwiper();
  initHeaderUI();
  initSearchUI();
  initProductsOnce();
});

function isLoggedIn() {
  return Boolean(
    localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
  );
}

function applyLoggedOutLayout() {
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
      applyLoggedOutLayout();
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

    try {
      const results = await fetchAllProducts({ search: q });
      allProducts = results;
      renderProducts(allProducts);
      setEmptyState(allProducts.length === 0);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  });

  // 아이콘 클릭 시 포커스만 (원하면 여기서도 submit 트리거 가능)
  icon.addEventListener("click", () => input.focus());
}

async function initProductsOnce() {
  if (productsRendered) return;

  try {
    allProducts = await fetchAllProducts(); // 전체
    renderProducts(allProducts);
    setEmptyState(allProducts.length === 0);
    productsRendered = true;
  } catch (err) {
    console.error("상품 로드 실패:", err);
    setEmptyState(true);
  }
}

async function fetchAllProducts({ search = "" } = {}) {
  const results = [];
  let nextUrl = null;

  do {
    const data = await fetchProducts({ nextUrl, search });
    results.push(...(data?.results || []));
    nextUrl = data?.next || null;
  } while (nextUrl);

  return results;
}

function setEmptyState(isEmpty) {
  const emptyEl = document.getElementById("emptyState");
  if (!emptyEl) return;
  emptyEl.hidden = !isEmpty;
}

function renderProducts(products) {
  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = products
    .map((p) => {
      const id = encodeURIComponent(p.id);
      const seller = p.seller?.store_name || p.seller?.name || "판매자";
      const img = p.image || "../assets/images/sample image.png";

      return `
        <li>
          <a class="product-card" href="../products/product.html?id=${id}">
            <div class="thumb">
              <img src="${img}" alt="${p.name}">
            </div>
            <div class="meta">
              <p class="seller">${seller}</p>
              <p class="name">${p.name}</p>
              <p class="price">${Number(p.price).toLocaleString()}원</p>
            </div>
          </a>
        </li>
      `;
    })
    .join("");
}
