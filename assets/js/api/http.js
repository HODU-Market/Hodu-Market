import { API_CONFIG, tokenManager } from "./config.js";

function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    controller,
    promise: Promise.race([
      promise(controller.signal),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), ms)),
    ]).finally(() => clearTimeout(timer)),
  };
}

export async function request(path, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${path}`;

  const { promise } = withTimeout(
    async (signal) => {
      const res = await fetch(url, {
        method: options.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal,
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const error = new Error(typeof data === "string" ? data : data?.detail || "Request failed");
        error.status = res.status;
        error.data = data;
        throw error;
      }

      return data;
    },
    API_CONFIG.TIMEOUT
  );

  return promise;
}

// 인증이 필요한 요청용 함수
export async function authRequest(path, options = {}) {
  const token = tokenManager.getAccessToken();

  if (!token) {
    const error = new Error("로그인이 필요합니다.");
    error.status = 401;
    throw error;
  }

  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// 토큰 갱신 함수
export async function refreshAccessToken() {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token이 없습니다.");
  }

  const data = await request("/accounts/token/refresh/", {
    method: "POST",
    body: { refresh: refreshToken },
  });

  tokenManager.setTokens(data.access);
  return data.access;
}

// 토큰 만료 시 자동 갱신 후 재요청하는 함수
export async function authRequestWithRefresh(path, options = {}) {
  try {
    return await authRequest(path, options);
  } catch (error) {
    // 토큰 만료 에러인 경우 갱신 시도
    if (error.status === 401 && error.data?.code === "token_not_valid") {
      try {
        await refreshAccessToken();
        return await authRequest(path, options);
      } catch (refreshError) {
        // 갱신도 실패하면 로그아웃 처리
        tokenManager.clearTokens();
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      }
    }
    throw error;
  }
}
