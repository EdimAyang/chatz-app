import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";

import { darkTheme, lightTheme } from "@/theme";
import { useThemeStore } from "@/store/theme.store";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode);

  return (
    <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  );
}
