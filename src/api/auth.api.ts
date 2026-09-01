import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { LoginDto, RegisterDto } from "@/types";

export const login = async (payload: LoginDto) => {
    console.log('Login called')
  const res = await api.post(`${ENDPOINTS.LOGIN}`, payload);
  return res.data;
};

export const register = async (payload: RegisterDto) => {
      console.log('Register called')
  const res = await api.post(`${ENDPOINTS.REGISTER}`, payload);
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post(`${ENDPOINTS.FORGOT_PASSWORD}`, { email });
  return res.data;
}

export const resetPassword = async (code: string, password: string) => {
  const res = await api.post(`${ENDPOINTS.RESET_PASSWORD}`, { code, password });
  return res.data;
}
