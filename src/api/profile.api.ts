import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/axios";
import type { ProfileResponse } from "@/types";

export const getUserProfile = async (id: string) => {
  const res = await api.get<ProfileResponse>(`${ENDPOINTS.PROFILE(id)}`);
  return res.data;
};

export const updateUserProfile = async (data: {
  username: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
}) => {
  const res = await api.put<ProfileResponse>(ENDPOINTS.UPDATE_PROFILE, data);
  return res.data;
};

export const uploadProfileAvatar = async (data: {}) => {
  const res = await api.patch<{
    success: boolean;
    message: string;
    data: Array<{ avatarUrl: string }>;
  }>(ENDPOINTS.UPDATE_PROFILE_AVATAR, data);
  return res.data;
};
