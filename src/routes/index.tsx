import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/appLayouts";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import OnboardingPage from "@/pages/onboarding";
import ContactsPage from "@/pages/contacts/index";
// import CallsPage from "@/pages/call";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";

import ChatPage from "@/pages/chat/index";
import NewChat from "@/pages/chat/new";
import Splash from "@/pages/splash/index";
import ErrorComponent from "#/components/app/ErrorComponent";
import NotFound from "#/components/app/NotFound";
import { PATHS } from "../lib/paths";
import ProtectedRoute from "./ProtectedRoute";
import GlobalLayout from "#/layouts/globalLayout";
import SearchScreen from "#/pages/search";

export const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      {
        index: true,
        element: <Splash />,
      },
      {
        path: PATHS.AUTH.LOGIN,
        element: <LoginPage />,
      },
      {
        path: PATHS.AUTH.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: PATHS.ONBOARDING.ONBOARDING,
        element: <OnboardingPage />,
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        id:"app",
        element: <AppLayout />,
        errorElement:<ErrorComponent/>,
        children: [
          {
            path: PATHS.CHAT.HOME,
            element: <HomePage />,
          },
          {
            path: PATHS.CONTACTS.CONTACTlIST,
            element: <ContactsPage />,
          },
          {
            path: PATHS.CHAT.PROFILE,
            element: <ProfilePage />,
          },
          {
            path: PATHS.SETTINGS.SETTING,
            element: <SettingsPage />,
          },
          {
            path: "/chat/:id",
            element: <ChatPage />,
          },
          {
            path: "/chat/new/:id",
            element: <NewChat />,
          },
          {
            path: PATHS.SEARCH.SEARCH,
            element: <SearchScreen />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
