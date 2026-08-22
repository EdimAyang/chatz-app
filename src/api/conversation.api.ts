import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { ConversationBetweenUsers, ConversationsResponse, CreateConversationResponse } from "@/types";

export const getConversations = async (
  limit: string,
  cursor: string,
  search: string,
): Promise<ConversationsResponse> => {
  const res = await api.get<ConversationsResponse>(ENDPOINTS.CONVERSATIONS, {
    params: {
      search,
      limit,
      cursor,
    },
  });
  return res.data;
};

export const getConversationBetween = async (
  id: string,
): Promise<ConversationBetweenUsers> => {
  const res = await api.get<ConversationBetweenUsers>(
    ENDPOINTS.CONVERSATIONBETWEENUSERS(id),
  );
  return res.data;
};

export const createConversation = async (
  id: string,
): Promise<CreateConversationResponse> => {
  const res = await api.post<CreateConversationResponse>(
    ENDPOINTS.CREATE_CONVERSATION(id),
  );
  return res.data;
};
