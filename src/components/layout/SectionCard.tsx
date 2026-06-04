import { ReactNode } from "react";

type Props = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, icon, children }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft-sm hover:shadow-soft-md transition-shadow duration-300">
      {title && (
        <div className="flex min-h-14 items-center gap-2.5 border-b border-slate-100 bg-transparent px-5 py-3.5">
          {icon && <span className="text-primary">{icon}</span>}
          <h2 className="font-heading text-base font-semibold text-slate-900">{title}</h2>
        </div>
      )}

      <div className="p-5">{children}</div>
    </section>
  );
}
