// assets/js/api/client.js

const BASE_URL = "https://openmarket.weniv.co.kr"; 
// 프로젝트에서 실제 사용하는 서버 주소로 맞추세요.
// (명세에는 host가 없어서, 흔히 사용하는 openmarket.weniv.co.kr을 기본값으로 둡니다.)

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
  const url = buildUrl(pathOrUrl);

  const headers = new Headers(options.headers || {});
  // JSON 요청 기본 헤더(단, FormData일 땐 자동으로 boundary 들어가야 하므로 제외)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && options.method && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  // 토큰이 있으면 자동 첨부 (명세: Authorization: Bearer {token})
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  // 본문 파싱 (응답이 비어있을 수도 있음)
  const contentType = res.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    // 서버가 내려주는 에러 구조가 다양하므로 최대한 안전하게 메시지 구성
    const message =
      (data && (data.detail || data.error || data.non_field_errors)) ||
      `HTTP ${res.status} ${res.statusText}`;
    const err = new Error(typeof message === "string" ? message : JSON.stringify(message));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
