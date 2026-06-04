import { api } from "@/lib/api";
import { AuthUser } from "@/types/auth";

import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuthStorage,
  getStoredAuthToken,
  getStoredAuthUser,
} from "./auth.storage";

type AuthResponse = {
  user: AuthUser;
  token: string;
};

type SetupInput = {
  businessName: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

function readStoredUser(): AuthUser | null {
  const storedUser = getStoredAuthUser();

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

export async function login(data: { username: string; password: string }) {
  const response = await api.post<AuthResponse>("/auth/login", data);
  const { user, token } = response.data;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  return user;
}

export async function getSetupStatus() {
  const response = await api.get<{ needsInitialUser: boolean }>(
    "/auth/setup-status",
    { timeout: 5000 }
  );
  return { requiresSetup: response.data.needsInitialUser };
}

export async function setupInitialUser(data: SetupInput) {
  const response = await api.post<AuthResponse>("/auth/setup", data);
  const { user, token } = response.data;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  return user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Si el backend no responde igual limpiamos la sesión local.
  } finally {
    clearAuthStorage();
  }
}

export async function getSession(): Promise<AuthUser | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getStoredAuthToken();

  if (!token) {
    clearAuthStorage();
    return null;
  }

  const cachedUser = readStoredUser();

  if (cachedUser) {
    return cachedUser;
  }

  try {
    const response = await api.get<{ user: AuthUser }>("/auth/me", {
      timeout: 5000,
    });
    const user = response.data.user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    clearAuthStorage();
    return null;
  }
}

export async function validateSession(): Promise<boolean> {
  const token = getStoredAuthToken();

  if (!token) {
    return false;
  }

  try {
    await api.get("/auth/me", { timeout: 5000 });
    return true;
  } catch {
    clearAuthStorage();
    return false;
  }
}
