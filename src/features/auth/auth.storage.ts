export const AUTH_USER_KEY = "roticeria_auth_user";
export const AUTH_TOKEN_KEY = "roticeria_auth_token";

export function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
