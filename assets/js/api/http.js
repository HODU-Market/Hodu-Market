import { API_CONFIG } from "./config.js";

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
        const message = typeof data === "string" ? data : data?.detail || "Request failed";
        throw new Error(message);
      }

      return data;
    },
    API_CONFIG.TIMEOUT
  );

  return promise;
}
