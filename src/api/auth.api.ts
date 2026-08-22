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
