import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  bio?: string;
  lastSeen?: string;
  createdAt?: string;
}

export interface Profile {
  success: boolean;
  isOnline: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    lastSeen: string;
    createdAt: string;
    location?: string;
    phoneNumber?: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  hydrated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isOnboarded: false,

      hydrated: false,

      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isOnboarded: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "chatz-auth",

      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isOnboarded: state.isOnboarded,
        hydrated: state.hydrated,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return;

          state.hydrated = true;
          state.isAuthenticated = !!state.token;
        };
      },
    },
  ),
);

interface UserState {
  isOnline: boolean;
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const useUserProfile = create<UserState>()(
  persist(
    (set) => ({
      isOnline: false,
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "chatz-user-profile",
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);
