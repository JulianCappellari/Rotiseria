import { ReactNode } from "react";

type Props = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, icon, children }: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="flex min-h-12 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4">
          {icon}
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
      )}

      <div className="p-4">{children}</div>
    </section>
  );
}
