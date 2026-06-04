import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Volver",
}: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-3 pb-1 md:flex-row md:items-end">
      <div className="min-w-0 space-y-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}

        <div className="flex items-center gap-3">
          <span className="block h-7 w-1 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 shrink-0" />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            {title}
          </h1>
        </div>

        {description && (
          <p className="mt-1.5 ml-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}
