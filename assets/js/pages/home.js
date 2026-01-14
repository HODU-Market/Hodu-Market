// /assets/js/pages/home.js
import { fetchProducts } from "../api/products.js";

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
      location.href = "../index.html";
    }
  });
}

function initSearchUI() {
  const searchForm = document.querySelector(".input-box");
  const searchIcon = document.querySelector(".search-icon");
  const searchInput = document.querySelector("#fieldInput");

  if (!searchForm || !searchIcon || !searchInput) return;

  const params = new URLSearchParams(window.location.search);
  const preset = params.get("q");
  if (preset) searchInput.value = preset;

  searchIcon.addEventListener("mousedown", () => {
    searchIcon.classList.add("is-active");
  });

  searchIcon.addEventListener("mouseup", () => {
    searchIcon.classList.remove("is-active");
  });

  searchIcon.addEventListener("mouseleave", () => {
    searchIcon.classList.remove("is-active");
  });

  searchIcon.addEventListener("click", () => {
    if (!searchInput.value.trim()) return;
    searchForm.requestSubmit();
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = searchInput.value.trim();
    const url = new URL(window.location.href);

    if (keyword) {
      url.searchParams.set("q", keyword);
    } else {
      url.searchParams.delete("q");
    }

    window.location.href = url.toString();
  });
}

async function initProducts() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("q")?.trim() || "";
  const isSearch = Boolean(search);

  try {
    const data = await fetchProducts({ search });
    let products = data?.results || [];

    if (search && !products.length) {
      const allProducts = await fetchAllProducts();
      const keyword = search.toLowerCase();
      products = allProducts.filter((product) => {
        const name = product?.name?.toLowerCase() || "";
        const seller =
          product?.seller?.store_name ||
          product?.seller?.name ||
          product?.seller?.username ||
          "";
        return name.includes(keyword) || seller.toLowerCase().includes(keyword);
      });
    }

    renderProducts(products, { isSearch });
  } catch (err) {
    console.error("Failed to load products:", err);
    renderProducts([], { isSearch });
  }
}

async function fetchAllProducts() {
  const results = [];
  let nextUrl = null;

  do {
    const data = await fetchProducts({ nextUrl });
    results.push(...(data?.results || []));
    nextUrl = data?.next || null;
  } while (nextUrl);

  return results;
}

function formatPrice(value) {
  const n = Number(value || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function renderProducts(products, { isSearch } = {}) {
  const list = document.getElementById("productList");
  const empty = document.getElementById("emptyState");

  if (!list) return;

  list.innerHTML = "";

  if (!products.length) {
    if (empty) empty.hidden = !isSearch;
    return;
  }

  if (empty) empty.hidden = true;

  const html = products
    .map((p) => {
      const id = encodeURIComponent(p.id ?? "");
      const seller =
        p.seller?.store_name || p.seller?.name || p.seller?.username || "판매자";
      const name = p.name ?? "상품명";
      const price = formatPrice(p.price);
      const img = p.image || "../assets/images/sample image.png";

      return `
        <li>
          <a class="product-card" href="../products/product.html?id=${id}">
            <div class="thumb">
              <img src="${img}" alt="${name}">
            </div>
            <div class="meta">
              <p class="seller">${seller}</p>
              <p class="name">${name}</p>
              <p class="price">${price}</p>
            </div>
          </a>
        </li>
      `;
    })
    .join("");

  list.insertAdjacentHTML("beforeend", html);
}
