// home.js
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

  searchIcon.addEventListener("click", () => {
    if (!searchInput.value.trim()) return;
    searchForm.submit();
  });
}

function initProducts() {
  renderProducts(getProducts());
}

const PRODUCTS_KEY = "hodu_products";

function formatPrice(value) {
  const n = Number(value || 0);
  return n.toLocaleString("ko-KR") + "원";
}

function getProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderProducts(products) {
  const list = document.getElementById("productList");
  const empty = document.getElementById("emptyState");

  if (!list || !empty) return;

  list.innerHTML = "";

  if (!products.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  const html = products
    .map((p) => {
      const id = encodeURIComponent(p.id ?? "");
      const seller = p.seller ?? "판매자";
      const name = p.name ?? "상품명";
      const price = formatPrice(p.price);
      const img = p.image ?? "../assets/images/product-placeholder.png";

      return `
        <li>
          <a class="product-card" href="../products/detail.html?id=${id}">
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
