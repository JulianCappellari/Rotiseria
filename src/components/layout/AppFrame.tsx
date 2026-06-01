"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "./AppShell";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
