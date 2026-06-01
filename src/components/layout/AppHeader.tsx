"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Circle, LogOut, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

import { isActivePath, navigationItems, routeTitles } from "./navigation";

export function AppHeader() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const title = routeTitles[pathname] || "Gestion";
  const today = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-orange-600" />
            <span className="capitalize">{today}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 md:flex">
            <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            <span>Local</span>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:flex">
            <UserCircle className="h-4 w-4 text-slate-500" />
            <span>{user?.name || "Sesion local"}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Cerrar sesion"
            title="Cerrar sesion"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto pb-1 lg:hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
