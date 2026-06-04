"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { clearAuthStorage } from "@/features/auth/auth.storage";
import { AuthUser } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setupRequired: boolean | null;
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

function SessionSplash({
  message,
  fallbackHref,
}: {
  message: string;
  fallbackHref?: string;
}) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!fallbackHref) return;

    const timer = window.setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [fallbackHref]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/8 p-5 text-center shadow-2xl">
        <div className="mx-auto mb-3 h-9 w-9 animate-pulse rounded-lg bg-orange-500" />

        <p className="text-sm font-medium">{message}</p>

        {showFallback && fallbackHref ? (
          <a
            href={fallbackHref}
            className="mt-3 inline-block text-xs text-orange-400 underline hover:text-orange-300"
          >
            Si no redirige, haz click aqui
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const redirectingToRef = useRef<string | null>(null);

  const isLoginPage = pathname === "/login";
  const isSetupPage = pathname === "/setup";

  const safeRedirect = useCallback(
    (path: string) => {
      if (pathname === path) return;
      if (redirectingToRef.current === path) return;

      redirectingToRef.current = path;
      router.replace(path);
    },
    [pathname, router]
  );

  useEffect(() => {
    if (redirectingToRef.current === pathname) {
      redirectingToRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(() => {
      if (!active) return;

      setBootError("El backend tardó demasiado en responder.");
      setIsLoading(false);
    }, SESSION_BOOT_TIMEOUT_MS);

    async function boot() {
      try {
        setBootError(null);

        const setupStatus = await getSetupStatus();
        const requiresSetup = Boolean(setupStatus.requiresSetup);

        if (!active) return;

        setSetupRequired(requiresSetup);

        if (requiresSetup) {
          clearAuthStorage();
          queryClient.clear();
          setUser(null);
          return;
        }

        const sessionUser = await getSession();

        if (!active) return;

        if (!sessionUser) {
          setUser(null);
          return;
        }

        const isValid = await validateSession();

        if (!active) return;

        if (!isValid) {
          clearAuthStorage();
          queryClient.clear();
          setUser(null);
          return;
        }

        setUser(sessionUser);
      } catch (error) {
        console.error("[AuthProvider] Error al iniciar auth:", error);

        if (!active) return;

        setUser(null);
        setSetupRequired(null);
        setBootError("No se pudo verificar la sesión.");
      } finally {
        window.clearTimeout(timeout);

        if (active) {
          setIsLoading(false);
        }
      }
    }

    void boot();

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [queryClient]);

  useEffect(() => {
    if (isLoading || setupRequired === null || bootError) return;

    if (setupRequired) {
      if (!isSetupPage) {
        safeRedirect("/setup");
      }
      return;
    }

    if (!setupRequired && !user) {
      if (!isLoginPage) {
        safeRedirect("/login");
      }
      return;
    }

    if (!setupRequired && user && (isLoginPage || isSetupPage)) {
      safeRedirect("/");
    }
  }, [
    bootError,
    isLoading,
    isLoginPage,
    isSetupPage,
    safeRedirect,
    setupRequired,
    user,
  ]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      setupRequired,

      async login(credentials) {
        const nextUser = await loginRequest(credentials);

        setSetupRequired(false);
        setUser(nextUser);

        safeRedirect("/");
      },

      async setupInitialUser(data) {
        const nextUser = await setupInitialUserRequest(data);

        setSetupRequired(false);
        setUser(nextUser);
        queryClient.clear();

        safeRedirect("/");
      },

      async logout() {
        try {
          await logoutRequest();
        } finally {
          clearAuthStorage();
          queryClient.clear();
          setUser(null);
          setSetupRequired(false);

          safeRedirect("/login");
        }
      },
    }),
    [isLoading, queryClient, safeRedirect, setupRequired, user]
  );

  if (bootError) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash message={bootError} />
      </AuthContext.Provider>
    );
  }

  if (isLoading || setupRequired === null) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash message="Preparando la sesion..." />
      </AuthContext.Provider>
    );
  }

  if (setupRequired && !isSetupPage) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash
          message="Preparando configuracion inicial..."
          fallbackHref="/setup"
        />
      </AuthContext.Provider>
    );
  }

  if (!setupRequired && !user && !isLoginPage) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash
          message="Redirigiendo al login..."
          fallbackHref="/login"
        />
      </AuthContext.Provider>
    );
  }

  if (!setupRequired && user && (isLoginPage || isSetupPage)) {
    return (
      <AuthContext.Provider value={value}>
        <SessionSplash message="Entrando al sistema..." />
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