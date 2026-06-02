"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Package, ShoppingBag, Wallet } from "lucide-react";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { StatCard } from "@/components/layout/StatCard";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";
import { getDashboardSummary } from "@/features/dashboard/dashboard.service";
import { orderStatusLabel } from "@/lib/business-labels";
import { getApiErrorMessage } from "@/lib/api-error";
import { getLocalDateKey } from "@/lib/date";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function DashboardPage() {
  const businessDate = getLocalDateKey();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard", businessDate],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando dashboard...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm font-medium text-red-600">
        {getApiErrorMessage(error, "Error al cargar dashboard.")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel principal"
        description="Resumen operativo de ventas, pedidos, stock y caja."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ventas de hoy"
          value={formatCurrency(data.todaySalesInCents)}
          icon={BarChart3}
          tone="orange"
        />
        <StatCard
          title="Pedidos pendientes"
          value={data.pendingOrders}
          icon={ShoppingBag}
          tone="blue"
        />
        <StatCard
          title="Stock bajo"
          value={data.lowStockCount}
          icon={Package}
          tone={data.lowStockCount > 0 ? "red" : "green"}
        />
        <StatCard
          title="Caja estimada"
          value={formatCurrency(data.estimatedProfitInCents)}
          icon={Wallet}
          tone="green"
        />
      </div>

      <DashboardCharts
        salesInCents={data.todaySalesInCents}
        paidInCents={data.todayPaidInCents}
        expensesInCents={data.todayExpensesInCents}
        estimatedProfitInCents={data.estimatedProfitInCents}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Pedidos recientes">
          {data.recentOrders.length === 0 ? (
            <EmptyState message="No hay pedidos recientes." />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-950">
                      {formatCurrency(order.totalInCents)}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {orderStatusLabel(order.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Stock bajo">
          {data.lowStock.length === 0 ? (
            <EmptyState message="No hay insumos con stock bajo." />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <p className="font-medium text-slate-950">{item.name}</p>
                  <p className="text-sm font-medium text-red-600">
                    {item.currentStock} / mín. {item.minStock} {item.unit?.symbol}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
