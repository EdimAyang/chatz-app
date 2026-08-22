import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { MessageResponse, SendMessageResponse, MessagePayload } from "@/types";

export const getMessages = async (
  id: string,
  limit: string,
  cursor: string,
): Promise<MessageResponse> => {
  const res = await api.get<MessageResponse>(ENDPOINTS.GETMESSAGES(id), {
    params: {
      limit,
      cursor,
    },
  });
  return res.data;
};



export const sendMessage = async (payload: MessagePayload): Promise<SendMessageResponse> => {
  const res = await api.post<SendMessageResponse>(ENDPOINTS.SENDMESSAGE, payload);
  return res.data;
};
