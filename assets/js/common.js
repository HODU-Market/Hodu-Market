const fileName = location.pathname.split('/').pop();
const isRootPage = fileName === '' || fileName === 'index.html';

const isSellerProductPage = location.pathname.endsWith("/seller-product.html");

const PATH = {
  components: isRootPage ? "./components" : "../components",
  assets: isRootPage ? "./assets" : "../assets",
  root: isRootPage ? "." : "..",
};

function initQtyControl() {
  const qtyControls = document.querySelectorAll('.qty-control');

  qtyControls.forEach((control) => {
    if (control.dataset.qtyCustom === "true") return;
    const minusBtn = control.querySelector('.qty-control__btn--minus');
    const plusBtn = control.querySelector('.qty-control__btn--plus');

    const input = control.querySelector('.qty-control__input');
    const stock = parseInt(control.dataset.stock, 10) || 0;
  
    updateButtonState(input, minusBtn, plusBtn, stock);

    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(input.value, 10) || 1;
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateButtonState(input, minusBtn, plusBtn, stock);
      }
    });

    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(input.value, 10) || 1;
      if (currentValue < stock) {
        input.value = currentValue + 1;
        updateButtonState(input, minusBtn, plusBtn, stock);
      }
    });
  });
}

function updateButtonState(input, minusBtn, plusBtn, stock) {
  const value = parseInt(input.value, 10) || 1;

  minusBtn.disabled = value <= 1;

  plusBtn.disabled = value >= stock || stock === 0;
}

document.addEventListener('DOMContentLoaded', initQtyControl);


const headerSnippet = document.getElementById("header-snippet");
const footerSnippet = document.getElementById("footer-snippet");

if (headerSnippet) {
  fetch(`${PATH.components}/header.html`)
    .then((response) => response.text())
    .then((data) => {
      const fixedData = data.replaceAll('../', `${PATH.root}/`);
      headerSnippet.innerHTML = fixedData;

      renderHeaderByAuth();
      initHeaderUI();
    });
}

if (footerSnippet) {
  fetch(`${PATH.components}/footer.html`)
    .then(response => response.text())
    .then(data => {
      const fixedData = data.replaceAll('../', `${PATH.root}/`);
      footerSnippet.innerHTML = fixedData;
    });
}

function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}

function getUserInfo() {
  const raw = localStorage.getItem("user_info");
  return raw ? JSON.parse(raw) : null;
}

function isBuyer() {
  return getUserInfo()?.user_type === "BUYER";
}

function renderHeaderByAuth() {
  const navList = document.getElementById("headerNav");
  if (!navList) return;

  // 로그아웃: 장바구니 + 로그인
  if (!isLoggedIn()) {
    navList.classList.remove("nav-list--seller");
    navList.innerHTML = `
      <li class="header-cart">
        <a href="${PATH.root}/cart/shopcart.html" class="header-cart-link">
          <img class="shopping-icon" src="${PATH.assets}/images/icons/icon-shopping-cart.svg" alt="">
          <span>장바구니</span>
        </a>
      </li>

      <li class="header-login">
        <a href="${PATH.root}/join/login.html" class="header-cart-link">
          <img class="user-icon" src="${PATH.assets}/images/icons/icon-user.svg" alt="">
          <span>로그인</span>
        </a>
      </li>
    `;
    return;
  }

  // 구매자: 장바구니 + 마이페이지
  if (isBuyer()) {
    navList.classList.remove("nav-list--seller");
    navList.innerHTML = `
      <li class="header-cart">
        <a href="${PATH.root}/cart/shopcart.html" class="header-cart-link">
          <img class="shopping-icon" src="${PATH.assets}/images/icons/icon-shopping-cart.svg" alt="">
          <span>장바구니</span>
        </a>
      </li>

      <li class="mypage">
        <button type="button" class="mypage-btn" aria-haspopup="true" aria-expanded="false">
          <img class="user-icon" src="${PATH.assets}/images/icons/icon-user.svg" alt="">
          <span>마이페이지</span>
        </button>

        <div class="dropdown" role="menu" aria-label="마이페이지 메뉴">
          <button type="button" class="dropdown-item" data-action="ui-only">마이페이지</button>
          <button type="button" class="dropdown-item" data-action="logout">로그아웃</button>
        </div>
      </li>
    `;
    initHeaderUI();
    return;
  }

  // 판매자: 마이페이지 아이콘 + 판매자 센터 버튼(요구사항)
  navList.classList.add("nav-list--seller");
  navList.innerHTML = `
    <li class="mypage">
      <button type="button" class="mypage-btn" aria-haspopup="true" aria-expanded="false">
        <img class="user-icon" src="${PATH.assets}/images/icons/icon-user.svg" alt="">
        <span>마이페이지</span>
      </button>

      <div class="dropdown" role="menu" aria-label="마이페이지 메뉴">
        <button type="button" class="dropdown-item" data-action="ui-only">마이페이지</button>
        <button type="button" class="dropdown-item" data-action="logout">로그아웃</button>
      </div>
    </li>

    <li class="seller-center">
      <a href="${PATH.root}/seller/seller-product.html" class="seller-btn">
        <img src="${PATH.assets}/images/icons/icon-shopping-bag.svg" alt="" class="seller-btn__icon">
        <span class="seller-btn__text">판매자 센터</span>
      </a>
    </li>
  `;
  initHeaderUI();
}

function initHeaderUI() {
  const mypage = document.querySelector(".mypage");
  const mypageBtn = document.querySelector(".mypage-btn");
  const dropdown = document.querySelector(".dropdown");
  if (!mypage || !mypageBtn || !dropdown) return;

  // 중복 바인딩 방지
  if (mypageBtn.dataset.bound === "true") return;
  mypageBtn.dataset.bound = "true";

  mypageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mypage.classList.toggle("is-open");
    mypageBtn.setAttribute(
      "aria-expanded",
      mypage.classList.contains("is-open") ? "true" : "false"
    );
  });

  // 문서 클릭 시 닫기 (중복 방지 위해 한 번만)
  if (document.body.dataset.mypageDocBound !== "true") {
    document.body.dataset.mypageDocBound = "true";

    document.addEventListener("click", () => {
      const mp = document.querySelector(".mypage");
      const btn = document.querySelector(".mypage-btn");
      if (!mp || !btn) return;
      mp.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  // 드롭다운 클릭
  dropdown.addEventListener("click", (e) => {
    const btn = e.target.closest(".dropdown-item");
    if (!btn) return;

    if (btn.dataset.action === "logout") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
      location.href = `${PATH.root}/index.html`;
    }
  });
}

