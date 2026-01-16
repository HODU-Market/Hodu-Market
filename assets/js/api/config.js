export const API_CONFIG = {
  BASE_URL: "https://api.wenivops.co.kr/services/open-market",
  TIMEOUT: 10000,
};

export const tokenManager = {
  getAccessToken() {
    return localStorage.getItem("access_token");
  },

  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },

  setTokens(access, refresh) {
    localStorage.setItem("access_token", access);
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    }
  },

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
  },

  getUserInfo() {
    const info = localStorage.getItem("user_info");
    return info ? JSON.parse(info) : null;
  },

  setUserInfo(user) {
    localStorage.setItem("user_info", JSON.stringify(user));
  },

  isLoggedIn() {
    return !!this.getAccessToken();
  },

  isBuyer() {
    const user = this.getUserInfo();
    return user?.user_type === "BUYER";
  },
};
