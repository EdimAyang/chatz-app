import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/routes";
import { RouterProvider } from "react-router-dom";
import { GlobalStyle } from "./styles/global";
import { queryClient } from "./lib/query-client";
import { AppThemeProvider } from "./components/app/ThemeMode";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <GlobalStyle />
        <RouterProvider router={router} />
      </AppThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
