import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

export type AppLockSettings = {
  delayMinutes: number;
};

const appLockStorageKey = (userId: string) => `chatz-app-lock:${userId}`;
const appLockBackgroundKey = (userId: string) =>
  `chatz-app-lock-background:${userId}`;

const notifyAppLockChange = () => {
  window.dispatchEvent(new Event("app-lock-settings-changed"));
};

export const getAppLockStorageKey = appLockStorageKey;
export const getAppLockBackgroundKey = appLockBackgroundKey;

export const readAppLockSettings = (
  userId: string,
): AppLockSettings | null => {
  const rawSettings = localStorage.getItem(appLockStorageKey(userId));
  if (!rawSettings) return null;

  try {
    const parsed: unknown = JSON.parse(rawSettings);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "delayMinutes" in parsed &&
      typeof parsed.delayMinutes === "number" &&
      [0, 1, 5, 10, 15].includes(parsed.delayMinutes)
    ) {
      return { delayMinutes: parsed.delayMinutes };
    }

    console.error("Stored app lock settings are invalid.");
    return { delayMinutes: 0 };
  } catch (error) {
    console.error("Could not read app lock settings.", error);
    return { delayMinutes: 0 };
  }
};

export const saveAppLockSettings = (
  userId: string,
  settings: AppLockSettings,
) => {
  localStorage.setItem(appLockStorageKey(userId), JSON.stringify(settings));
  notifyAppLockChange();
};

export const removeAppLockSettings = (userId: string) => {
  localStorage.removeItem(appLockStorageKey(userId));
  localStorage.removeItem(appLockBackgroundKey(userId));
  notifyAppLockChange();
};

export const requestAppLock = () => {
  window.dispatchEvent(new Event("app-lock-requested"));
};

const isPreviouslyRegisteredAuthenticator = (error: unknown) =>
  error instanceof Error &&
  error.name === "InvalidStateError" &&
  /authenticator.*(?:previously|already) registered/i.test(error.message);

const assertVerificationSucceeded = (responseData: unknown) => {
  const result =
    typeof responseData === "object" &&
    responseData !== null &&
    "data" in responseData
      ? responseData.data
      : responseData;
  const isFailure = (value: unknown) =>
    typeof value === "object" &&
    value !== null &&
    (("success" in value && value.success === false) ||
      ("verified" in value && value.verified === false));

  if (isFailure(responseData) || isFailure(result)) {
    throw new Error("Biometric verification was not successful.");
  }
};

export const registerBiometric = async () => {
  const optionsResponse = await api.post(ENDPOINTS.BIOMETRIC_REGISTER_OPTIONS);
  const options = optionsResponse.data.data;
  let registrationResponse;
  try {
    registrationResponse = await startRegistration({
      optionsJSON: options,
    });
  } catch (error) {
    if (isPreviouslyRegisteredAuthenticator(error)) {
      return { alreadyRegistered: true };
    }
    throw error;
  }

  const verificationResponse = await api.post(
    ENDPOINTS.BIOMETRIC_REGISTER_VERIFY,
    registrationResponse,
  );

  assertVerificationSucceeded(verificationResponse.data);
  return { alreadyRegistered: false, response: verificationResponse.data };
};

export const authenticateBiometric = async () => {
  const optionsResponse = await api.post(
    ENDPOINTS.BIOMETRIC_AUTHENTICATE_OPTIONS,
  );
  const options = optionsResponse.data.data;
  const authenticationResponse = await startAuthentication({
    optionsJSON: options,
  });
  const verificationResponse = await api.post(
    ENDPOINTS.BIOMETRIC_AUTHENTICATE_VERIFY,
    authenticationResponse,
  );

  assertVerificationSucceeded(verificationResponse.data);
  return verificationResponse.data;
};
