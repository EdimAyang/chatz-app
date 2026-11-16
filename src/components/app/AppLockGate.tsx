import { useCallback, useEffect, useState, type ReactNode } from "react";
import styled, { keyframes } from "styled-components";
import { Fingerprint, LoaderCircle, LogOut, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import {
  authenticateBiometric,
  getAppLockBackgroundKey,
  getAppLockStorageKey,
  readAppLockSettings,
  type AppLockSettings,
} from "#/biometrics";
import { useAuthStore } from "@/store/auth.store";
import { useWebSocketStore } from "@/store/websocket.store";

type AppLockGateProps = {
  children: ReactNode;
};

const shouldLockOnStartup = (userId: string) => {
  const settings = readAppLockSettings(userId);
  if (!settings) return false;

  const backgroundAt = Number(
    sessionStorage.getItem(getAppLockBackgroundKey(userId)),
  );
  if (!backgroundAt) return true;

  return Date.now() - backgroundAt >= settings.delayMinutes * 60_000;
};

export default function AppLockGate({ children }: AppLockGateProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const logout = useAuthStore((state) => state.logout);
  const disconnect = useWebSocketStore((state) => state.disconnect);
  const [settings, setSettings] = useState<AppLockSettings | null>(() =>
    userId ? readAppLockSettings(userId) : null,
  );
  const [isLocked, setIsLocked] = useState(() =>
    userId ? shouldLockOnStartup(userId) : false,
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const lockForUser = useCallback(() => {
    if (!userId) return;
    const currentSettings = readAppLockSettings(userId);
    setSettings(currentSettings);
    if (currentSettings) setIsLocked(true);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setSettings(null);
      setIsLocked(false);
      return;
    }

    setSettings(readAppLockSettings(userId));
    setIsLocked(shouldLockOnStartup(userId));

    const backgroundKey = getAppLockBackgroundKey(userId);
    const storageKey = getAppLockStorageKey(userId);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sessionStorage.setItem(backgroundKey, String(Date.now()));
        return;
      }

      const currentSettings = readAppLockSettings(userId);
      const backgroundAt = Number(sessionStorage.getItem(backgroundKey));
      if (
        currentSettings &&
        backgroundAt &&
        Date.now() - backgroundAt >= currentSettings.delayMinutes * 60_000
      ) {
        setIsLocked(true);
      }
      sessionStorage.removeItem(backgroundKey);
    };

    const handlePageHide = () => {
      sessionStorage.setItem(backgroundKey, String(Date.now()));
    };

    const handleSettingsChanged = () => {
      const nextSettings = readAppLockSettings(userId);
      setSettings(nextSettings);
      if (!nextSettings) {
        setIsLocked(false);
        sessionStorage.removeItem(backgroundKey);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;

      const nextSettings = readAppLockSettings(userId);
      setSettings(nextSettings);
      setIsLocked(Boolean(nextSettings));
      if (!nextSettings) sessionStorage.removeItem(backgroundKey);
    };

    const handleLockRequested = () => lockForUser();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("app-lock-settings-changed", handleSettingsChanged);
    window.addEventListener("app-lock-requested", handleLockRequested);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "app-lock-settings-changed",
        handleSettingsChanged,
      );
      window.removeEventListener("app-lock-requested", handleLockRequested);
    };
  }, [lockForUser, userId]);

  const unlock = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);

    try {
      await authenticateBiometric();
      if (userId) {
        sessionStorage.removeItem(getAppLockBackgroundKey(userId));
      }
      setIsLocked(false);
    } catch (error) {
      console.error("Could not authenticate app lock.", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not verify your device. Please try again.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isLocked || !settings) return children;

  return (
    <LockScreen role="dialog" aria-modal="true" aria-labelledby="app-lock-title">
      <LockBrand>Chatz</LockBrand>
      <LockContent>
        <LockIcon>
          <LockKeyhole size={22} />
        </LockIcon>
        <LockTitle id="app-lock-title">Chatz is locked</LockTitle>
        <LockDescription>
          Verify your identity with your fingerprint or your device passcode.
        </LockDescription>
        <FingerprintButton
          type="button"
          onClick={unlock}
          disabled={isAuthenticating}
          aria-busy={isAuthenticating}
          aria-label={isAuthenticating ? "Verifying identity" : "Unlock Chatz"}
        >
          {isAuthenticating ? (
            <Spinner size={42} aria-hidden="true" />
          ) : (
            <Fingerprint size={58} strokeWidth={1.5} />
          )}
        </FingerprintButton>
        <UnlockStatus role="status" aria-live="polite">
          {isAuthenticating ? "Verifying…" : "Touch to unlock"}
        </UnlockStatus>
        <SignOutButton
          type="button"
          onClick={() => {
            disconnect();
            logout();
          }}
        >
          <LogOut size={16} />
          Sign out instead
        </SignOutButton>
      </LockContent>
    </LockScreen>
  );
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LockScreen = styled.main`
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LockBrand = styled.div`
  position: absolute;
  top: max(28px, env(safe-area-inset-top));
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const LockContent = styled.div`
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const LockIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.secondary};
`;

const LockTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
`;

const LockDescription = styled.p`
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

const FingerprintButton = styled.button`
  width: 104px;
  height: 104px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  border-radius: 32px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.md};

  &:disabled {
    cursor: wait;
    opacity: 0.8;
  }
`;

const Spinner = styled(LoaderCircle)`
  animation: ${spin} 0.9s linear infinite;
`;

const UnlockStatus = styled.p`
  min-height: 20px;
  margin-top: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

const SignOutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 600;
`;
