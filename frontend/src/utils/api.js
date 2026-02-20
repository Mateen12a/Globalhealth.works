// src/utils/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

let isLoggingOut = false;

export function forceLogout() {
  if (isLoggingOut) return;
  if (window.location.pathname === "/login" || window.location.pathname === "/signup") return;

  isLoggingOut = true;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "/login?session=expired";
}

export function setupGlobalFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    if (response.status === 401) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      const isAuthRoute = url.includes("/api/auth/login") || url.includes("/api/auth/register") || url.includes("/api/auth/signup");
      if (!isAuthRoute) {
        forceLogout();
      }
    }

    return response;
  };
}

export function getImageUrl(imgPath) {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath;
  return `${API_URL}${imgPath}`;
}

export function setupGlobalAxiosInterceptor() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        forceLogout();
      }
      return Promise.reject(error);
    }
  );
}

export default api;
