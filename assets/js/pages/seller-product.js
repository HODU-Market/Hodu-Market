import {
  createProduct,
  fetchProductDetail,
  updateProduct,
} from "../api/products.js";

const DEFAULT_NAME_LIMIT = 20;
const EDITOR_PLACEHOLDER = "에디터 영역";

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || params.get("product_id");
}

function getAuthToken() {
  return (
    localStorage.getItem("access_token") || localStorage.getItem("accessToken")
  );
}

function getUserType() {
  const raw = localStorage.getItem("user_info");
  return raw ? JSON.parse(raw)?.user_type : null;
}

function setupNameCounter() {
  const nameInput = document.getElementById("product-name");
  const countElement = document.querySelector(".byte-count");
  if (!nameInput || !countElement) return null;

  const maxLength =
    Number.parseInt(nameInput.getAttribute("maxlength"), 10) ||
    DEFAULT_NAME_LIMIT;

  const update = () => {
    const currentLength = nameInput.value.length;
    countElement.textContent = `${currentLength}/${maxLength}`;
  };

  nameInput.addEventListener("input", update);
  update();

  return update;
}

function setupShippingTabs() {
  const buttons = Array.from(
    document.querySelectorAll(".btn-tab[data-shipping-method]")
  );

  if (buttons.length === 0) {
    return {
      setActive: () => null,
      getActive: () => null,
    };
  }

  const setActive = (method) => {
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.shippingMethod === method);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.dataset.shippingMethod);
    });
  });

  const getActive = () =>
    buttons.find((btn) => btn.classList.contains("active"))?.dataset
      .shippingMethod || null;

  const currentActive = getActive();
  if (!currentActive && buttons[0]) {
    setActive(buttons[0].dataset.shippingMethod);
  }

  return { setActive, getActive };
}

function setupImagePreview() {
  const input = document.getElementById("product-img");
  const previewImage = document.querySelector(".upload-label img");
  if (!input || !previewImage) {
    return {
      setFromUrl: () => null,
      reset: () => null,
      getFile: () => null,
    };
  }

  const defaultSrc = previewImage.getAttribute("src") || "";
  const defaultAlt = previewImage.getAttribute("alt") || "이미지 추가";
  let objectUrl = null;

  const revokeObjectUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  };

  const setPreview = (src, altText) => {
    previewImage.src = src || defaultSrc;
    previewImage.alt = altText || defaultAlt;
  };

  const reset = () => {
    revokeObjectUrl();
    setPreview(defaultSrc, defaultAlt);
  };

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) {
      reset();
      return;
    }

    revokeObjectUrl();
    objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl, file.name ? `${file.name} 미리보기` : "선택한 이미지");
  });

  return {
    setFromUrl: (src, altText) => {
      revokeObjectUrl();
      if (src) {
        setPreview(src, altText || "상품 이미지");
      } else {
        reset();
      }
    },
    reset,
    getFile: () => input.files && input.files[0],
  };
}

function setupEditor() {
  const editorBox = document.getElementById("product-info");
  const editorText = editorBox?.querySelector(".editor-text");

  if (!editorBox || !editorText) {
    return {
      setText: () => null,
      getText: () => "",
    };
  }

  editorText.setAttribute("contenteditable", "true");
  editorText.setAttribute("role", "textbox");
  editorText.setAttribute("aria-multiline", "true");
  editorText.setAttribute("aria-label", "상품 상세 정보");

  const applyPlaceholder = () => {
    editorText.textContent = EDITOR_PLACEHOLDER;
    editorBox.classList.remove("has-content");
  };

  const setText = (text) => {
    const content = text?.trim();
    if (content) {
      editorText.textContent = content;
      editorBox.classList.add("has-content");
    } else {
      applyPlaceholder();
    }
  };

  const getText = () => {
    if (!editorBox.classList.contains("has-content")) return "";
    const content = editorText.textContent.trim();
    return content === EDITOR_PLACEHOLDER ? "" : content;
  };

  editorText.addEventListener("focus", () => {
    if (!editorBox.classList.contains("has-content")) {
      editorText.textContent = "";
    }
  });

  editorBox.addEventListener("click", () => {
    editorText.focus();
  });

  editorText.addEventListener("blur", () => {
    if (!editorText.textContent.trim()) {
      applyPlaceholder();
    }
  });

  editorText.addEventListener("input", () => {
    const content = editorText.textContent.trim();
    if (content) {
      editorBox.classList.add("has-content");
    } else {
      editorBox.classList.remove("has-content");
    }
  });

  setText("");
  return { setText, getText };
}

function parseNumber(value) {
  if (value === undefined || value === null) return NaN;
  const normalized = String(value).trim();
  if (!normalized) return NaN;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

function formatApiError(error) {
  if (!error) return "요청에 실패했습니다.";

  const data = error.data;
  if (data) {
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (typeof data === "object") {
      const [key] = Object.keys(data);
      const value = data[key];
      if (Array.isArray(value)) return value[0];
      if (value) return String(value);
    }
  }

  return error.message || "요청에 실패했습니다.";
}

function collectFormValues({ editor, shippingTabs, imagePreview }) {
  const nameInput = document.getElementById("product-name");
  const priceInput = document.getElementById("product-price");
  const shippingFeeInput = document.getElementById("product-shipping-fee");
  const stockInput = document.getElementById("product-stock");

  return {
    name: nameInput?.value.trim() || "",
    info: editor.getText(),
    price: parseNumber(priceInput?.value),
    shipping_method: shippingTabs.getActive(),
    shipping_fee: parseNumber(shippingFeeInput?.value),
    stock: parseNumber(stockInput?.value),
    image: imagePreview.getFile(),
  };
}

function validateForm(values, { isEdit }) {
  if (!values.name) return "상품명을 입력해주세요.";
  if (!Number.isFinite(values.price) || values.price < 0)
    return "판매가를 입력해주세요.";
  if (!values.shipping_method) return "배송방법을 선택해주세요.";
  if (!Number.isFinite(values.shipping_fee) || values.shipping_fee < 0)
    return "기본 배송비를 입력해주세요.";
  if (!Number.isFinite(values.stock) || values.stock < 0)
    return "재고를 입력해주세요.";
  if (!values.info) return "상품 상세 정보를 입력해주세요.";
  if (!isEdit && !values.image) return "상품 이미지를 등록해주세요.";
  return null;
}

function buildUpdatePayload(values) {
  const payload = {
    name: values.name,
    info: values.info,
    price: values.price,
    shipping_method: values.shipping_method,
    shipping_fee: values.shipping_fee,
    stock: values.stock,
  };

  if (values.image) {
    payload.image = values.image;
  }

  return payload;
}

function setSubmitState(button, isLoading, baseText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? "저장 중..." : baseText;
}

function applyEditMode() {
  const title = document.querySelector(".page-title");
  const submitButton = document.querySelector(".btn-primary");

  if (title) title.textContent = "상품 수정";
  if (submitButton) submitButton.textContent = "수정하기";
  document.title = "상품 수정 - 호두마켓";
}

async function loadProductDetail(productId, helpers = {}) {
  try {
    const product = await fetchProductDetail(productId);

    const nameInput = document.getElementById("product-name");
    const priceInput = document.getElementById("product-price");
    const shippingFeeInput = document.getElementById("product-shipping-fee");
    const stockInput = document.getElementById("product-stock");

    if (nameInput) nameInput.value = product?.name ?? "";
    if (priceInput) priceInput.value = product?.price ?? "";
    if (shippingFeeInput)
      shippingFeeInput.value = product?.shipping_fee ?? "";
    if (stockInput) stockInput.value = product?.stock ?? "";

    if (helpers.setActive && product?.shipping_method) {
      helpers.setActive(product.shipping_method);
    }

    if (helpers.updateNameCount) {
      helpers.updateNameCount();
    }

    if (helpers.setEditorText) {
      helpers.setEditorText(product?.info || "");
    }

    if (helpers.setImageFromUrl) {
      helpers.setImageFromUrl(
        product?.image || "",
        product?.name ? `${product.name} 이미지` : "상품 이미지"
      );
    }
  } catch (error) {
    console.error("상품 정보를 불러오지 못했습니다.", error);
    if (helpers.setEditorText) {
      helpers.setEditorText("");
    }
    if (helpers.resetImage) {
      helpers.resetImage();
    }
    alert(formatApiError(error));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const updateNameCount = setupNameCounter();
  const shippingTabs = setupShippingTabs();
  const imagePreview = setupImagePreview();
  const editor = setupEditor();

  const form = document.querySelector(".register-form");
  const cancelButton = document.querySelector(".btn-white");
  const submitButton = document.querySelector(".btn-primary");

  const productId = getProductId();
  const isEdit = Boolean(productId);

  if (isEdit) {
    applyEditMode();
    loadProductDetail(productId, {
      ...shippingTabs,
      updateNameCount,
      setEditorText: editor.setText,
      setImageFromUrl: imagePreview.setFromUrl,
      resetImage: imagePreview.reset,
    });
  } else {
    editor.setText("");
  }

  cancelButton?.addEventListener("click", () => {
    history.back();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = getAuthToken();
    if (!token) {
      alert("로그인이 필요합니다.");
      location.href = "../join/login.html";
      return;
    }

    const userType = getUserType();
    if (userType && userType !== "SELLER") {
      alert("판매자만 상품을 등록하거나 수정할 수 있습니다.");
      return;
    }

    const values = collectFormValues({ editor, shippingTabs, imagePreview });
    const validationError = validateForm(values, { isEdit });
    if (validationError) {
      alert(validationError);
      return;
    }

    const baseButtonText = isEdit ? "수정하기" : "저장하기";
    setSubmitState(submitButton, true, baseButtonText);

    try {
      const result = isEdit
        ? await updateProduct(productId, buildUpdatePayload(values))
        : await createProduct(values);
      const savedId = isEdit ? productId : result?.id;

      alert(isEdit ? "상품이 수정되었습니다." : "상품이 등록되었습니다.");
      if (savedId) {
        location.href = `../products/product.html?id=${savedId}`;
      }
    } catch (error) {
      alert(formatApiError(error));
    } finally {
      setSubmitState(submitButton, false, baseButtonText);
    }
  });
});
