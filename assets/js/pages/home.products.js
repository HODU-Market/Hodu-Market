import { fetchProducts } from "../api/products.js"; 

const $list = document.querySelector("#product-list");
const $btnMore = document.querySelector("#btn-load-more");

const $searchForm = document.querySelector("#product-search-form");
const $searchInput = document.querySelector("#product-search-input");

let nextUrl = null;
let currentSearch = "";
let isLoading = false;

function formatPrice(value) {
  const num = Number(value ?? 0);
  return `${num.toLocaleString("ko-KR")}원`;
}

function shippingLabel(method) {
  if (method === "PARCEL") return "택배배송";
  if (method === "DELIVERY") return "직접배송";
  return "";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createProductItem(product) {
  const li = document.createElement("li");
  li.className = "product-card";

  const detailHref = `../products/product.html?id=${encodeURIComponent(product.id)}`;

  li.innerHTML = `
    <a class="product-card__link" href="${detailHref}">
      <div class="product-card__thumb">
        <img
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        />
      </div>

      <div class="product-card__body">
        <p class="product-card__seller">${escapeHtml(product?.seller?.store_name ?? product?.seller?.name ?? "")}</p>
        <h3 class="product-card__name">${escapeHtml(product.name)}</h3>
        <p class="product-card__price">${formatPrice(product.price)}</p>
        <p class="product-card__meta">
          <span class="product-card__ship">${shippingLabel(product.shipping_method)}</span>
          <span class="product-card__fee">배송비 ${formatPrice(product.shipping_fee)}</span>
        </p>
      </div>
    </a>
  `;

  return li;
}

function renderProducts(products, { reset = false } = {}) {
  if (reset) $list.innerHTML = "";

  if (!products || products.length === 0) {
    if (reset) {
      $list.innerHTML = `<li class="product-empty">표시할 상품이 없습니다.</li>`;
    }
    return;
  }

  const frag = document.createDocumentFragment();
  products.forEach((p) => frag.appendChild(createProductItem(p)));
  $list.appendChild(frag);
}

function updateMoreButton() {
  $btnMore.hidden = !nextUrl;
}

async function loadProducts({ reset = false } = {}) {
  if (isLoading) return;
  isLoading = true;

  try {
    const data = await fetchProducts({
      nextUrl: reset ? null : nextUrl,
      search: reset ? currentSearch : "",
    });

    nextUrl = data?.next ?? null;

    renderProducts(data?.results ?? [], { reset });
    updateMoreButton();
  } catch (err) {
    console.error(err);
    if (reset) {
      $list.innerHTML = `<li class="product-empty">상품을 불러오지 못했습니다.</li>`;
    }
  } finally {
    isLoading = false;
  }
}

$btnMore?.addEventListener("click", () => {
  loadProducts({ reset: false });
});

$searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  currentSearch = ($searchInput?.value ?? "").trim();
  nextUrl = null;
  loadProducts({ reset: true });
});

loadProducts({ reset: true });
