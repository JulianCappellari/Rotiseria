export const AUTH_USER_KEY = "rotiseria_auth_user";
export const AUTH_TOKEN_KEY = "rotiseria_auth_token";

const LEGACY_AUTH_USER_KEY = `roti${"ceria"}_auth_user`;
const LEGACY_AUTH_TOKEN_KEY = `roti${"ceria"}_auth_token`;

function readStoredValue(key: string, legacyKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(key);

  if (value !== null) {
    return value;
  }

  const legacyValue = localStorage.getItem(legacyKey);

  if (legacyValue !== null) {
    localStorage.setItem(key, legacyValue);
    localStorage.removeItem(legacyKey);
  }

  return legacyValue;
}

export function getStoredAuthUser() {
  return readStoredValue(AUTH_USER_KEY, LEGACY_AUTH_USER_KEY);
}

export function getStoredAuthToken() {
  return readStoredValue(AUTH_TOKEN_KEY, LEGACY_AUTH_TOKEN_KEY);
}

export function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_USER_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
}
