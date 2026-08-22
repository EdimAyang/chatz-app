// src/store/theme.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "light" | "dark";

type ThemeStore = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "light",

      setMode: (mode) => {
        set({ mode });
      },

      toggle: () => {
        set((state) => ({
          mode: state.mode === "dark" ? "light" : "dark",
        }));
      },
    }),
    {
      name: "chatz:theme",
    },
  ),
);
