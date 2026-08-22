import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";


export const sendAudio = async (payload: FormData) => {
  const res = await api.post<any>(ENDPOINTS.SEND_AUDIO, payload);
  return res.data;
};
