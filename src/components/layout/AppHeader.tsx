"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

import { isActivePath, navigationItems, routeTitles } from "./navigation";

export function AppHeader() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const title = routeTitles[pathname] || "Gestión";
  const today = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md md:px-6 shadow-soft-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="capitalize font-medium">{today}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status pill */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Local
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={() => void logout()}
            className="text-slate-500 hover:text-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
        {navigationItems
          .filter((item) => !item.adminOnly || user?.role === "ADMIN")
          .map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </header>
  );
}
