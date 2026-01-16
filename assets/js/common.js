const isRootPage =
  location.pathname === "/" ||
  location.pathname.endsWith("/index.html");

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
  fetch("../components/header.html")
    .then(response => response.text())
    .then(data => {
      headerSnippet.innerHTML = data;
      renderHeaderByAuth(); 
    });
}

if (footerSnippet) {
  fetch("../components/footer.html")
    .then(response => response.text())
    .then(data => {
      footerSnippet.innerHTML = data;
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
  const headerInner = document.querySelector(".header-inner");
  const isSellerPage = location.pathname.includes("/seller/");

  // 로그아웃: 장바구니 + 로그인
  if (!isLoggedIn()) {
    if (!isSellerPage) {
      headerInner?.classList.add("header-inner--logged-out");
    }
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

  headerInner?.classList.remove("header-inner--logged-out");

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
      <a href="${PATH.root}/seller/index.html" class="seller-btn">
        <img src="${PATH.assets}/images/icons/icon-shopping-bag.svg" alt="" class="seller-btn__icon">
        <span class="seller-btn__text">판매자 센터</span>
      </a>
    </li>
  `;
  initHeaderUI();
  const sellerBtn = navList.querySelector(".seller-btn");
  sellerBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openPreparingModal("이 페이지는 준비중입니다.");
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
    mypageBtn.setAttribute("aria-expanded", mypage.classList.contains("is-open"));
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
      location.href = "../index.html";
    }
  });
}

function openPreparingModal(message = "이 페이지는 준비 중입니다.") {
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

