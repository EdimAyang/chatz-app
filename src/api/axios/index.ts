import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { BASE_URL } from "@/api/endpoints";

let isRedirectingToLogin = false;

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if ((status === 401 ) && !isRedirectingToLogin) {
      isRedirectingToLogin = true;

      useAuthStore.getState().logout();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
