import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { UserResponse, UsersResponse } from "@/types";

export const getUsers = async (
   page:number,
  limit: number,
  search: string,
): Promise<UsersResponse> => {
  const res = await api.get<UsersResponse>(ENDPOINTS.GET_USERS, {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
    },
  });
  return res.data;
};


export const getUser = async (id: string): Promise<UserResponse> => {
  const res = await api.get<UserResponse>(ENDPOINTS.GET_USER(id));
  return res.data;
};
