// /assets/js/pages/home.js
import { fetchProducts } from "../api/products.api.js";

const IMAGE_FALLBACK = "../assets/images/sample image.png";
document.addEventListener("DOMContentLoaded", () => {
  initBannerSwiper();
  initHeaderUI();
  initSearchUI();
  initProducts();
});

function initBannerSwiper() {
  if (!document.querySelector(".banner-swiper")) return;

  new Swiper(".banner-swiper", {
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

function initHeaderUI() {
  const mypage = document.querySelector(".mypage");
  const mypageBtn = document.querySelector(".mypage-btn");
  const dropdown = document.querySelector(".dropdown");
  const cart = document.querySelector(".cart");
  const cartLink = document.querySelector(".cart-link");

  if (!mypage || !mypageBtn || !dropdown) return;

  cartLink?.addEventListener("click", () => {
    cart?.classList.add("is-active");
  });

  const openMenu = () => {
    mypage.classList.add("is-open");
    mypageBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    mypage.classList.remove("is-open");
    mypageBtn.setAttribute("aria-expanded", "false");
  };

  mypageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mypage.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  document.addEventListener("click", (e) => {
    if (!mypage.contains(e.target)) closeMenu();
  });

  dropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".dropdown-item");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "ui-only") {
      closeMenu();
      return;
    }

    if (action === "logout") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      location.href = "#";
    }
  });
}

function initSearchUI() {
  const searchForm = document.querySelector(".input-box");
  const searchIcon = document.querySelector(".search-icon");
  const searchInput = document.querySelector("#fieldInput");

  if (!searchForm || !searchIcon || !searchInput) return;

  searchIcon.addEventListener("mousedown", () => {
    searchIcon.classList.add("is-active");
  });

  searchIcon.addEventListener("mouseup", () => {
    searchIcon.classList.remove("is-active");
  });

  searchIcon.addEventListener("mouseleave", () => {
    searchIcon.classList.remove("is-active");
  });

  const handleSearch = () => {
    const keyword = searchInput.value.trim();
    setSearchQuery(keyword);
    loadProducts({ search: keyword });
  };

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSearch();
  });

  searchIcon.addEventListener("click", () => {
    handleSearch();
  });
}

function initProducts() {
  const search = getSearchQuery();
  const searchInput = document.querySelector("#fieldInput");
  if (searchInput && search) {
    searchInput.value = search;
  }
  loadProducts({ search });
}

function formatPrice(value) {
  const n = Number(value || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q")?.trim() || "";
}

function setSearchQuery(value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set("q", value);
  } else {
    url.searchParams.delete("q");
  }
  window.history.replaceState({}, "", url);
}

async function loadProducts({ search } = {}) {
  const list = document.getElementById("productList");
  if (!list) return;

  renderMessage(list, "product-loading", "상품을 불러오는 중입니다.");

  try {
    const data = await fetchProducts({ search });
    const products = Array.isArray(data?.results) ? data.results : [];
    renderProducts(list, products);
  } catch (error) {
    console.error("상품 목록 로드 실패:", error);
    renderMessage(list, "product-error", "상품 정보를 불러오지 못했습니다.");
  }
}

function renderMessage(list, className, message) {
  list.innerHTML = "";
  const item = document.createElement("li");
  item.className = className;
  item.textContent = message;
  list.appendChild(item);
}

function renderProducts(list, products) {
  list.innerHTML = "";

  if (!products.length) {
    renderMessage(list, "empty", "등록된 상품이 없습니다.");
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });
  list.appendChild(fragment);
}

function createProductCard(product) {
  const id = encodeURIComponent(product?.id ?? "");
  const seller =
    product?.seller?.store_name ||
    product?.seller?.name ||
    product?.seller?.username ||
    "판매자";
  const name = product?.name || "상품명";
  const price = formatPrice(product?.price);
  const imgSrc = product?.image || IMAGE_FALLBACK;

  const li = document.createElement("li");
  const link = document.createElement("a");
  link.className = "product-card";
  link.href = `../products/product.html?id=${id}`;

  const thumb = document.createElement("div");
  thumb.className = "thumb";

  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = name;
  thumb.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "meta";

  const sellerEl = document.createElement("p");
  sellerEl.className = "seller";
  sellerEl.textContent = seller;

  const nameEl = document.createElement("p");
  nameEl.className = "name";
  nameEl.textContent = name;

  const priceEl = document.createElement("p");
  priceEl.className = "price";
  priceEl.textContent = price;

  meta.append(sellerEl, nameEl, priceEl);
  link.append(thumb, meta);
  li.appendChild(link);

  return li;
}
