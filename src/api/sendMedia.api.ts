import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";

export const sendImage = async (payload: FormData) => {
  const res = await api.post<any>(ENDPOINTS.SEND_IMAGE, payload);
  return res.data;
};

export const sendFile = async (payload: FormData) => {
  const res = await api.post<any>(ENDPOINTS.SEND_DOCUMENT, payload);
  return res.data;
};

export const sendVideo = async (payload: FormData) => {
  const res = await api.post<any>(ENDPOINTS.SEND_VIDEO, payload);
  return res.data;
};
