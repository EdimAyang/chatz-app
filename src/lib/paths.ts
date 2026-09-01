export const PATHS = {
  //onboarding
  ONBOARDING: {
    SPLASH: "/",
    ONBOARDING: "/onboarding",
  },

  //auth
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  //pages
  CHAT: {
    HOME: "/home",
    PROFILE: "/profile",
    NEW:(id:string)=> `/chat/new/${id}`,
    CHAT:(id:string)=> `/chat/${id}`
  },
  

  //search

  SEARCH: {
    SEARCH: "/search"
  },

  //calls
  CALLS: {
    LOGS: "/calls",
  },

  //CONTACTS
  CONTACTS: {
    CONTACTlIST: "/contacts",
  },

  //SETTINGS
  SETTINGS: {
    SETTING: "/settings",
  },
} as const;
