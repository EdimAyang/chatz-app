import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { UserResponse, UsersResponse } from "@/types";

export const getUsers = async (
  limit: string,
  cursor: string,
): Promise<UsersResponse> => {
  const res = await api.get<UsersResponse>(ENDPOINTS.GET_USERS, {
    params: {
      limit,
      cursor,
    },
  });
  return res.data;
};

export const getUser = async (id: string): Promise<UserResponse> => {
  const res = await api.get<UserResponse>(ENDPOINTS.GET_USER(id));
  return res.data;
};
