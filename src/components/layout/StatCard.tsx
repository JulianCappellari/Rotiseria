"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "orange" | "green" | "blue" | "slate" | "red";
};

const toneClasses = {
  orange: "bg-amber-50 text-amber-600 border-amber-200/50",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  blue: "bg-sky-50 text-sky-600 border-sky-200/50",
  slate: "bg-slate-100 text-slate-600 border-slate-200/50",
  red: "bg-red-50 text-red-600 border-red-200/50",
};

export function StatCard({ title, value, icon: Icon, tone = "orange" }: Props) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-soft-sm hover:shadow-soft-md transition-shadow duration-300"
    >
      <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-slate-100/40 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{title}</span>
        <div className={`flex size-10 items-center justify-center rounded-xl border ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950 font-heading">
        {value}
      </p>
    </motion.div>
  );
}
