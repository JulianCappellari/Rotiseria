"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Circle } from "lucide-react";

import { isActivePath, navigationItems } from "./navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-[hsl(var(--sidebar))] px-4 py-5 text-[hsl(var(--sidebar-foreground))] lg:block">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
          <ChefHat className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">Roticería</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" />
            Operación activa
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={active ? "h-4 w-4 text-orange-600" : "h-4 w-4"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
