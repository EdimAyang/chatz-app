import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let canInstall = false;

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => canInstall;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredPrompt = event as BeforeInstallPromptEvent;
    canInstall = true;

    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    canInstall = false;

    notify();
  });
}

export const usePWAInstall = () => {
  const canInstallApp = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false,
  );

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("App installed");
    }

    deferredPrompt = null;
    canInstall = false;

    notify();
  };

  return {
    canInstall: canInstallApp,
    install,
  };
};
