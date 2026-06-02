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
  getSetupStatus,
  login as loginRequest,
  logout as logoutRequest,
  setupInitialUser as setupInitialUserRequest,
  validateSession,
} from "@/features/auth/auth.service";
import { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setupRequired: boolean;
  login: (data: { username: string; password: string }) => Promise<void>;
  setupInitialUser: (data: {
    businessName: string;
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_BOOT_TIMEOUT_MS = 6000;

function SessionSplash({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/8 p-5 text-center shadow-2xl">
        <div className="mx-auto mb-3 h-9 w-9 animate-pulse rounded-lg bg-orange-500" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === "/login";
  const isSetupPage = pathname === "/setup";

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(() => {
      if (active) {
        setIsLoading(false);
      }
    }, SESSION_BOOT_TIMEOUT_MS);

    getSetupStatus()
      .then(async ({ requiresSetup }) => {
        if (!active) return;

        setSetupRequired(requiresSetup);

        if (requiresSetup) {
          setUser(null);
          queryClient.clear();
          return null;
        }

        return getSession();
      })
      .then((sessionUser) => {
        if (!active) return;
        if (!sessionUser) return;

        setUser(sessionUser);

        if (sessionUser) {
          void validateSession().then((isValid) => {
            if (!active || isValid) return;
            setUser(null);
            queryClient.clear();
            router.replace("/login");
          });
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [queryClient, router]);

  useEffect(() => {
    if (isLoading) return;

    if (setupRequired && !isSetupPage) {
      router.replace("/setup");
      return;
    }

    if (setupRequired) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (user && (isLoginPage || isSetupPage)) {
      router.replace("/");
    }
  }, [isLoading, isLoginPage, isSetupPage, router, setupRequired, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      setupRequired,
      async login(credentials) {
        const nextUser = await loginRequest(credentials);
        setSetupRequired(false);
        setUser(nextUser);
        router.replace("/");
      },
      async setupInitialUser(data) {
        const nextUser = await setupInitialUserRequest(data);
        setSetupRequired(false);
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
    [isLoading, queryClient, router, setupRequired, user]
  );

  if (isLoginPage || isSetupPage) {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }

  if (isLoading) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash message="Preparando la sesion..." />
      </AuthContext.Provider>
    );
  }

  if (!user || setupRequired) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash
          message={
            setupRequired
              ? "Preparando configuracion inicial..."
              : "Redirigiendo al login..."
          }
        />
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
