import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "orange" | "green" | "blue" | "slate" | "red";
};

const toneClasses = {
  orange: "bg-orange-50 text-orange-700",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-sky-50 text-sky-700",
  slate: "bg-slate-100 text-slate-700",
  red: "bg-red-50 text-red-700",
};

export function StatCard({ title, value, icon: Icon, tone = "orange" }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`flex size-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
