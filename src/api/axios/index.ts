import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { BASE_URL } from "@/api/endpoints";

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
    if (error.response?.status === 401) {
      console.log("Unauthorized");
    }

    return Promise.reject(error);
  },
);
