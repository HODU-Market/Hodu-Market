// assets/js/api/auth.js
import { apiRequest } from "./client.js";

export async function login(username, password) {
  const data = await apiRequest("/accounts/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // 명세: { access, refresh, user: {...} }
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("refreshToken이 없습니다.");

  const data = await apiRequest("/accounts/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });

  localStorage.setItem("accessToken", data.access);
  return data.access;
}
