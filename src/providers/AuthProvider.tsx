"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  getSession,
  login as loginRequest,
  logout as logoutRequest,
} from "@/features/auth/auth.service";
import { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function SessionSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/8 p-5 text-center shadow-2xl">
        <div className="mx-auto mb-3 h-9 w-9 animate-pulse rounded-lg bg-orange-500" />
        <p className="text-sm font-medium">Preparando la sesion...</p>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    let active = true;

    getSession()
      .then((sessionUser) => {
        if (active) setUser(sessionUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (user && isLoginPage) {
      router.replace("/");
    }
  }, [isLoading, isLoginPage, router, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(credentials) {
        const nextUser = await loginRequest(credentials);
        setUser(nextUser);
        router.replace("/");
      },
      async logout() {
        try {
          await logoutRequest();
        } finally {
          queryClient.clear();
          setUser(null);
          router.replace("/login");
        }
      },
    }),
    [isLoading, queryClient, router, user]
  );

  const shouldBlockPage = !isLoginPage && (isLoading || !user);

  return (
    <AuthContext.Provider value={value}>
      {shouldBlockPage ? <SessionSplash /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
