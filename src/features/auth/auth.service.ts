import { api } from "@/lib/api";
import { AuthUser } from "@/types/auth";

type AuthResponse = {
  user: AuthUser;
};

const AUTH_USER_KEY = "rotiseria_auth_user";

export async function login(data: { username: string; password: string }) {
  const response = await api.post<AuthResponse>("/auth/login", data);

  const user = response.data.user;

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  return user;
}

export async function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export async function getSession(): Promise<AuthUser | null> {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedUser) {
      return JSON.parse(storedUser) as AuthUser;
    }
  }

  return null;
}