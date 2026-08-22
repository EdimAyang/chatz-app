const base = {
  radii: { sm: "12px", md: "20px", lg: "24px", xl: "30px", pill: "999px" },
  space: (n: number) => `${n * 8}px`,
  font: `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
};

export const lightTheme = {
  ...base,
  mode: "light" as "light" | "dark",
  colors: {
    primary: "#FFFFFF",

    // Accent
    secondary: "#FF4000",
    secondaryDark: "#E63900",
    secondarySoft: "#FFF0EB",

    // Backgrounds
    background: "#F8F8F8",
    surface: "#FFFFFF",

    // Text
    textPrimary: "#1F1F1F",
    textSecondary: "#7A7A7A",
    textTertiary: "#B5B5B5",

    // Status
    success: "#34C759",
    error: "#FF3B30",

    // UI
    border: "#EEEEEE",
    divider: "#F0F0F0",

    // Chat bubbles
    bubbleIncoming: "#FFFFFF",
    bubbleOutgoing: "#FF4000",

    overlay: "rgba(15,15,15,0.45)",
  },

  shadows: {
    sm: "0 2px 8px rgba(20,20,20,0.04)",
    md: "0 6px 20px rgba(20,20,20,0.06)",
    lg: "0 12px 32px rgba(20,20,20,0.10)",

    orange: "0 10px 24px rgba(255,64,0,0.35)",
  },
};

export const darkTheme = {
  ...base,
  mode: "dark" as "light" | "dark",

  colors: {
    primary: "#0E0E10",

    // Accent
    secondary: "#FF4000",
    secondaryDark: "#E63900",
    secondarySoft: "rgba(255,64,0,0.18)",

    // Backgrounds
    background: "#0E0E10",
    surface: "#1A1A1D",

    // Text
    textPrimary: "#F5F5F7",
    textSecondary: "#9A9AA0",
    textTertiary: "#5E5E66",

    // Status
    success: "#34C759",
    error: "#FF453A",

    // UI
    border: "#27272B",
    divider: "#22222630",

    // Chat bubbles
    bubbleIncoming: "#1A1A1D",
    bubbleOutgoing: "#FF4000",

    overlay: "rgba(0,0,0,0.6)",
  },

  shadows: {
    sm: "0 2px 8px rgba(0,0,0,0.30)",
    md: "0 6px 20px rgba(0,0,0,0.35)",
    lg: "0 12px 32px rgba(0,0,0,0.45)",

    orange: "0 10px 24px rgba(255,64,0,0.40)",
  },
};
// Default export kept for any legacy imports
export const theme = lightTheme;
export type AppTheme = typeof lightTheme;
