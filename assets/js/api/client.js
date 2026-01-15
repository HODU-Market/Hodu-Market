// assets/js/api/client.js
const BASE_URL = "https://api.wenivops.co.kr/services/open-market";
const FALLBACK_BASE_URL = "https://openmarket.weniv.co.kr";
// 프로젝트에서 실제 사용하는 서버 주소로 맞추세요.

function buildUrl(pathOrUrl) {
  // next 값이 absolute URL이면 그대로 사용
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  // path면 BASE_URL 붙이기
  return `${BASE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export async function apiRequest(pathOrUrl, options = {}) {
  let url = buildUrl(pathOrUrl);

  const headers = new Headers(options.headers || {});

  // JSON 요청 기본 헤더 (FormData는 boundary 자동 세팅 필요하므로 제외)
  const isFormData = options.body instanceof FormData;
  if (
    !isFormData &&
    !headers.has("Content-Type") &&
    options.method &&
    options.method !== "GET"
  ) {
    headers.set("Content-Type", "application/json");
  }

  // 토큰이 있으면 자동 첨부 (Authorization: Bearer {token})
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (error) {
    if (error instanceof TypeError && !/^https?:\/\//i.test(pathOrUrl)) {
      url = `${FALLBACK_BASE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
      res = await fetch(url, { ...options, headers });
    } else {
      throw error;
    }
  }

  // 응답 파싱 (비어있을 수도 있음)
  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.detail || data.error || data.non_field_errors)) ||
      `HTTP ${res.status} ${res.statusText}`;
    const err = new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
