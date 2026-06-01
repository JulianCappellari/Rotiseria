"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

import { getDailyReport, getMonthlyReport } from "@/features/reports/report.service";
import { formatCurrency } from "@/lib/formatters";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportCharts } from "@/features/reports/ReportCharts";

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-yellow-700/40 bg-black/50 p-5">
      <p className="text-sm text-yellow-100/60">{title}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-300">{value}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", mode, date, year, month],
    queryFn: () =>
      mode === "daily"
        ? getDailyReport(date || undefined)
        : getMonthlyReport(year, month),
  });

  if (isLoading) return <p className="text-yellow-100/60">Cargando reportes...</p>;
  if (isError || !data) return <p className="text-red-400">Error al cargar reportes.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Balance de ventas, gastos, compras y rentabilidad."
      />

      <SectionCard title="Filtros" icon={<BarChart3 className="h-5 w-5 text-yellow-300" />}>
        <div className="grid gap-4 md:grid-cols-4">
          <Button
            variant={mode === "daily" ? "default" : "outline"}
            onClick={() => setMode("daily")}
          >
            Diario
          </Button>

          <Button
            variant={mode === "monthly" ? "default" : "outline"}
            onClick={() => setMode("monthly")}
          >
            Mensual
          </Button>

          {mode === "daily" ? (
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          ) : (
            <>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
            </>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ventas" value={formatCurrency(data.salesInCents)} />
        <StatCard title="Cobrado" value={formatCurrency(data.paidInCents)} />
        <StatCard title="Gastos" value={formatCurrency(data.expensesInCents)} />
        <StatCard title="Compras" value={formatCurrency(data.purchasesInCents)} />
        <StatCard title="Ganancia bruta estimada" value={formatCurrency(data.estimatedGrossProfitInCents)} />
        <StatCard title="Ganancia neta estimada" value={formatCurrency(data.estimatedNetProfitInCents)} />
        <StatCard title="Balance de caja" value={formatCurrency(data.cashBalanceInCents)} />
        <StatCard title="Ticket promedio" value={formatCurrency(data.averageTicketInCents)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Productos más vendidos">
          {data.topProducts.length === 0 ? (
            <EmptyState message="No hay ventas registradas." />
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product) => (
                <div key={product.productId} className="flex justify-between rounded-xl border border-yellow-700/30 p-3">
                  <span className="text-yellow-50">{product.productName}</span>
                  <span className="text-yellow-300">
                    {product.quantity} u. · {formatCurrency(product.totalInCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Gastos por categoría">
          {data.expensesByCategory.length === 0 ? (
            <EmptyState message="No hay gastos registrados." />
          ) : (
            <div className="space-y-3">
              {data.expensesByCategory.map((item) => (
                <div key={item.categoryName} className="flex justify-between rounded-xl border border-yellow-700/30 p-3">
                  <span className="text-yellow-50">{item.categoryName}</span>
                  <span className="text-yellow-300">{formatCurrency(item.totalInCents)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        <ReportCharts report={data} />
      </div>
    </div>
  );
}