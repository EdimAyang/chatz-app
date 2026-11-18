import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import {
  Moon,
  LogOut,
  ChevronRight,
  Camera,
  BellPlus,
  BellRing,
  BellOff,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { Divider } from "@/components/app/Divider";
import { Modal } from "@/components/app/Modal";
import { useThemeStore } from "#/store/theme.store";
import { useAuthStore, useUserProfile } from "@/store/auth.store";
import { PATHS } from "@/lib/paths";
import { useWebSocketStore } from "@/store/websocket.store";
import InstallButton from "#/components/app/installationButton";
import { BottomNav } from "#/components/app/BottomNav";
import { MobileNav } from "#/layouts/appLayouts";
import { useNotificationPermission } from "#/hooks/useNotificationPermission";
import { getToken } from "firebase/messaging";
import { getFirebaseMessagingInstance } from "@/firebase/index";
import { registerFirebaseMessagingSW } from "@/firebase/register";
import { api } from "#/api/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  authenticateBiometric,
  disableAppLock as disableStoredAppLock,
  readAppLockSettings,
  registerBiometric,
  saveAppLockSettings,
  type AppLockSettings,
} from "#/biometrics";

const APP_LOCK_DURATIONS = [
  { value: 0, label: "Immediately" },
  { value: 1, label: "After 1 minute" },
  { value: 5, label: "After 5 minutes" },
  { value: 10, label: "After 10 minutes" },
  { value: 15, label: "After 15 minutes" },
];

const spinnerAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Settings = () => {
  const { mode, toggle } = useThemeStore();
  const { permission, requestPermission } = useNotificationPermission();
  const userId = useAuthStore((state) => state.user?.id);
  const [appLockSettings, setAppLockSettings] =
    useState<AppLockSettings | null>(() =>
      userId ? readAppLockSettings(userId) : null,
  );
  const [isDurationDialogOpen, setIsDurationDialogOpen] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  const appLockEnabled = appLockSettings?.enabled ?? false;

  const notificationsEnabled = permission === "granted";

  useEffect(() => {
    if (!userId) {
      setAppLockSettings(null);
      return;
    }

    const updateAppLockDelay = () => {
      setAppLockSettings(readAppLockSettings(userId));
    };

    updateAppLockDelay();
    window.addEventListener("app-lock-settings-changed", updateAppLockDelay);
    window.addEventListener("storage", updateAppLockDelay);

    return () => {
      window.removeEventListener(
        "app-lock-settings-changed",
        updateAppLockDelay,
      );
      window.removeEventListener("storage", updateAppLockDelay);
    };
  }, [userId]);

  const openAppLockSettings = () => {
    setIsDurationDialogOpen(true);
  };

  const saveAppLockDuration = async (delayMinutes: number) => {
    if (!userId || bioLoading) return;

    setBioLoading(true);

    try {
      const currentSettings = readAppLockSettings(userId);

      // Only register during the first setup.
      const isFirstSetup = currentSettings === null;

      let authenticatorAlreadyRegistered = false;

      if (isFirstSetup) {
        const registration = await registerBiometric();

        authenticatorAlreadyRegistered = registration.alreadyRegistered;
      }

      const nextSettings = {
        enabled: currentSettings?.enabled ?? true,
        delayMinutes,
      };
      saveAppLockSettings(userId, nextSettings);

      setAppLockSettings(nextSettings);
      setIsDurationDialogOpen(false);

      toast.success(
        isFirstSetup && authenticatorAlreadyRegistered
          ? "Your existing authenticator is ready. App lock is enabled."
          : isFirstSetup
            ? "App lock enabled on this device."
            : nextSettings.enabled
              ? "App lock duration updated."
              : "App lock duration saved.",
      );
    } catch (error) {
      toast.error("Could not enable app lock.");

      // toast.error(
      //   error instanceof Error
      //     ? error.message
      //     : "Could not enable app lock. Please try again.",
      // );
    } finally {
      setBioLoading(false);
    }
  };

  const enableAppLock = () => {
    if (!userId || bioLoading) return;

    const currentSettings = readAppLockSettings(userId);
    if (!currentSettings) {
      setIsDurationDialogOpen(true);
      return;
    }

    if (currentSettings.enabled) return;

    const nextSettings = { ...currentSettings, enabled: true };
    saveAppLockSettings(userId, nextSettings);
    setAppLockSettings(nextSettings);
    toast.success("App lock enabled.");
  };

  const turnOffAppLock = async () => {
    if (!userId || !appLockSettings || bioLoading) return;

    setBioLoading(true);
    try {
      await authenticateBiometric();
      disableStoredAppLock(userId);
      setAppLockSettings({ ...appLockSettings, enabled: false });
      toast.success("App lock disabled.");
    } catch (error) {
      console.error("Could not verify identity to disable app lock.", error);
      toast.error("Could not verify identity to disable app lock.");
    } finally {
      setBioLoading(false);
    }
  };

  const toggleAppLock = () => {
    if (appLockEnabled) {
      void turnOffAppLock();
      return;
    }

    enableAppLock();
  };

  const enableNotifications = async () => {
    if (Notification.permission === "denied") {
      alert(
        "Notifications are blocked. Please enable them from your browser settings.",
      );
      return;
    }
    const result = await requestPermission();

    if (result !== "granted") {
      toast.error("Notification permission was not granted");
      return;
    }

    try {
      const messaging = await getFirebaseMessagingInstance();

      if (!messaging) {
        throw new Error("Firebase Messaging isn't supported");
        return;
      }

      const serviceWorkerRegistration = await registerFirebaseMessagingSW();

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
      });

      if (!token) {
        toast.error("No FCM token available");
        return;
      }

      await api.post(PATHS.PUSH_NOTIFICATIONS.NOTIFICATIONS, {
        deviceToken: token,
      });
    } catch (error) {
      throw new Error(
        (error as Error).message ||
          "An error occurred while registering for push notifications",
      );
    }
  };

  const dark = mode === "dark";
  // const nav = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { profile } = useUserProfile();

  const { disconnect } = useWebSocketStore();

  const handleLogout = () => {
    disconnect();
    logout();
  };

  return (
    <>
      <Wrapper>
        <Header>
          <Title>Settings</Title>
        </Header>
        <Link
          to={PATHS.CHAT.PROFILE}
          style={{ display: "block", color: "inherit", textDecoration: "none" }}
        >
          <Profile>
            <div style={{ position: "relative" }}>
              <Avatar
                src={
                  profile?.data.avatar
                    ? profile.data.avatar
                    : "https://i.pravatar.cc/150?u=me"
                }
                size={64}
              />
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  bottom: -2,
                  background: "#FF4000",
                  color: "#fff",
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff",
                }}
              >
                <Camera size={12} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <PName>{profile?.data.username}</PName>
              <PSub>{profile?.data.email}</PSub>
            </div>
            <ChevronRight color="#B5B5B5" />
          </Profile>
        </Link>

        <Card>
          <Item as="div">
            <IconWrap $bg="#EEF1FF" $c="#5B6CFF">
              <Moon size={18} />
            </IconWrap>
            <Lbl>Dark mode</Lbl>
            <Toggle
              $on={dark}
              onClick={toggle}
              aria-label="Toggle dark mode"
              aria-pressed={dark}
            >
              <Knob
                animate={{ left: dark ? 23 : 3 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            </Toggle>
          </Item>
          <Divider />
          <InstallButton />
          <Divider />
          <Item>
            <IconWrap $bg="#E0F7EC" $c="#34C759">
              {permission === "granted" ? (
                <BellRing size={18} />
              ) : permission === "denied" ? (
                <BellOff size={18} />
              ) : (
                <BellPlus size={18} />
              )}
            </IconWrap>
            <Lbl>
              {permission === "denied"
                ? "Notifications blocked"
                : permission === "granted"
                  ? "Notifications enabled"
                  : "Enable notifications"}
            </Lbl>
            <Toggle
              $on={notificationsEnabled}
              onClick={() => enableNotifications()}
              aria-label="Notification permission"
              aria-pressed={permission === "granted"}
            >
              <Knob
                animate={{
                  left: permission === "granted" ? 23 : 3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 32,
                }}
              />
            </Toggle>
          </Item>
          <Divider />
          <LockItem as="div">
            <IconWrap $bg="#F0E9FF" $c="#7656D6">
              <LockKeyhole size={18} />
            </IconWrap>
            <Lbl>App lock</Lbl>
            {appLockSettings && (
              <LockAction
                type="button"
                onClick={openAppLockSettings}
                aria-label="Change app lock duration"
              >
                {appLockSettings.delayMinutes === 0
                  ? "Immediately"
                  : `${appLockSettings.delayMinutes} min`}
              </LockAction>
            )}
            <Toggle
              $on={appLockEnabled}
              onClick={toggleAppLock}
              disabled={bioLoading}
              aria-label="Toggle app lock"
              aria-pressed={appLockEnabled}
            >
              <Knob
                animate={{ left: appLockEnabled ? 23 : 3 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            </Toggle>
          </LockItem>

          {/* <Divider />
        <Item>
          <IconWrap $bg="#FFE4EF" $c="#FA549C">
            <Shield size={18} />
          </IconWrap>
          <Lbl>Security</Lbl>
          <ChevronRight color="#B5B5B5" />
        </Item> */}
        </Card>

        {/* <Card>
        <Item>
          <IconWrap $bg="#F0F0F0" $c="#7A7A7A">
            <DownloadCloud size={18} />
          </IconWrap>
          <Lbl>Install app</Lbl>
          <ChevronRight color="#B5B5B5" />
        </Item>
      </Card> */}

        <LogoutBtn onClick={() => handleLogout()}>
          <LogOut size={18} /> Log out
        </LogoutBtn>
      </Wrapper>

      <MobileNav>
        <BottomNav />
      </MobileNav>

      <Modal
        open={isDurationDialogOpen}
        onClose={() => {
          if (!bioLoading) setIsDurationDialogOpen(false);
        }}
      >
        <DialogTitle>Lock app after</DialogTitle>
        {!appLockSettings && (
          <DialogDescription>
            The first time, your device will ask you to register a fingerprint
            or passkey.
          </DialogDescription>
        )}
        <DurationOptions role="radiogroup" aria-label="App lock duration">
          {APP_LOCK_DURATIONS.map(({ value, label }) => (
            <DurationOption
              key={value}
              type="button"
              role="radio"
              aria-checked={appLockSettings?.delayMinutes === value}
              $selected={appLockSettings?.delayMinutes === value}
              disabled={bioLoading}
              onClick={() => void saveAppLockDuration(value)}
            >
              <span>{label}</span>
              <RadioMark $selected={appLockSettings?.delayMinutes === value} />
            </DurationOption>
          ))}
        </DurationOptions>
        <DialogActions>
          {bioLoading && (
            <SavingStatus role="status" aria-live="polite">
              <ButtonSpinner size={16} aria-hidden="true" />
              {!appLockSettings
                ? "Registering device and enabling app lock…"
                : "Saving app lock duration…"}
            </SavingStatus>
          )}
        </DialogActions>
      </Modal>
    </>
  );
};

export default Settings;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 80px;

  @media (max-width: 767px) {
    padding-bottom: 80px;
  }
`;

const Header = styled.header`
  flex-shrink: 0;
  padding: 24px 20px 8px;
`;
const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;
const Profile = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: ${({ theme }) => theme.colors.surface};
  margin: 16px 20px;
  padding: 18px;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const PName = styled.div`
  font-weight: 700;
  font-size: 17px;
`;
const PSub = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 2px;
`;
const Card = styled.div`
  margin: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 22px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  height: auto;
`;
const Item = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
`;

const LockItem = styled(Item)`
  flex-wrap: wrap;
`;
const IconWrap = styled.div<{ $bg: string; $c: string }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $c }) => $c};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const Lbl = styled.span`
  flex: 1;
  font-weight: 600;
  font-size: 15px;
`;
const Toggle = styled(motion.button)<{ $on: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: ${({ $on, theme }) =>
    $on ? theme.colors.secondary : theme.colors.divider};
  position: relative;
  transition: background 0.2s;
`;
const Knob = styled(motion.span)`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;
const LogoutBtn = styled.button`
  margin: 8px 20px 2px;
  width: calc(100% - 40px);
  padding: 16px;
  border-radius: 20px;
  background: #ffeeee;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  // margin-bottom: 7rem;
`;

const LockAction = styled.button`
  padding: 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
`;

const DialogTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
`;

const DialogDescription = styled.p`
  margin: 8px 0 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

const DurationOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DurationOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.background : "transparent"};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  text-align: left;
`;

const RadioMark = styled.span<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.secondary : theme.colors.textTertiary};
  border-radius: 50%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: ${({ $selected, theme }) =>
      $selected ? theme.colors.secondary : "transparent"};
  }
`;

const DialogActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const SavingStatus = styled.p`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

const ButtonSpinner = styled(LoaderCircle)`
  animation: ${spinnerAnimation} 0.9s linear infinite;
  font-size: 13px;
`;
