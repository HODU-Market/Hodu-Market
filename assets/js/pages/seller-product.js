    import { fetchProductDetail } from "../api/products.js";

    const DEFAULT_NAME_LIMIT = 20;

    function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("product_id");
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

  return { setActive, getActive };
}

function setupImagePreview() {
  const input = document.getElementById("product-img");
  const previewImage = document.querySelector(".upload-label img");
  if (!input || !previewImage) {
    return {
      setFromUrl: () => null,
      reset: () => null,
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
  };
}

function setEditorText(info) {
  const editorBox = document.getElementById("product-info");
  const editorText = editorBox?.querySelector(".editor-text");
  if (!editorBox || !editorText) return;

    const content = info?.trim();

    if (content) {
        editorText.textContent = content;
        editorBox.classList.add("has-content");
    } else {
        editorText.textContent = "에디터 영역";
        editorBox.classList.remove("has-content");
    }
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
        if (shippingFeeInput) shippingFeeInput.value = product?.shipping_fee ?? "";
        if (stockInput) stockInput.value = product?.stock ?? "";

        if (helpers.setActive && product?.shipping_method) {
        helpers.setActive(product.shipping_method);
        }

        if (helpers.updateNameCount) {
        helpers.updateNameCount();
        }

        setEditorText(product?.info || "");

    if (helpers.setImageFromUrl) {
      helpers.setImageFromUrl(
        product?.image || "",
        product?.name ? `${product.name} 이미지` : "상품 이미지"
      );
    }
  } catch (error) {
    console.error("상품 정보를 불러오지 못했습니다.", error);
    setEditorText("");
    if (helpers.resetImage) {
      helpers.resetImage();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const updateNameCount = setupNameCounter();
  const shippingTabs = setupShippingTabs();
  const imagePreview = setupImagePreview();

  setEditorText("");

  const productId = getProductId();
  if (productId) {
    loadProductDetail(productId, {
      ...shippingTabs,
      updateNameCount,
      setImageFromUrl: imagePreview.setFromUrl,
      resetImage: imagePreview.reset,
    });
  }
});
