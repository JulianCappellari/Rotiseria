"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { isActivePath, navigationItems } from "./navigation";
import { useAuth } from "@/providers/AuthProvider";
import { getBusinessSettings } from "@/features/settings/settings.service";

const sidebarVariants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 320, damping: 24 } },
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: businessSettings } = useQuery({
    queryKey: ["settings", "business"],
    queryFn: getBusinessSettings,
  });
  const businessName = businessSettings?.name?.trim() || "Rotiseria";

  return (
    <aside
      className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-white/5 lg:flex"
      style={{
        background: "linear-gradient(175deg, hsl(24 25% 8%) 0%, hsl(222 30% 9%) 100%)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-900/40">
          <ChefHat className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-base font-bold text-white tracking-tight truncate max-w-[145px]">
            {businessName}
          </h1>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[110px]">
              Operacion local
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <motion.nav
        variants={sidebarVariants}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
      >
        {navigationItems
          .filter((item) => !item.adminOnly || user?.role === "ADMIN")
          .map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <motion.div key={item.href} variants={navItemVariants}>
                <Link
                  href={item.href}
                  className={`group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-white border border-orange-500/20 shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
                  )}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
      </motion.nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="rounded-xl bg-white/5 px-3 py-2.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuario</p>
          <p className="mt-0.5 text-sm font-medium text-slate-200 truncate">{user?.name || "—"}</p>
          {user?.role && (
            <p className="text-xs text-orange-400/80 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
