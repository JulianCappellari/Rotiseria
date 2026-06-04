"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Package, ShoppingBag, Wallet } from "lucide-react";

import { motion } from "framer-motion";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.05
    },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 25
    }
  },
};

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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim}>
        <PageHeader
          title="Panel principal"
          description="Resumen operativo de ventas, pedidos, stock y caja."
        />
      </motion.div>

      <motion.div variants={itemAnim} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      </motion.div>

      <motion.div variants={itemAnim}>
        <DashboardCharts
          salesInCents={data.todaySalesInCents}
          paidInCents={data.todayPaidInCents}
          expensesInCents={data.todayExpensesInCents}
          estimatedProfitInCents={data.estimatedProfitInCents}
        />
      </motion.div>

      <motion.div variants={itemAnim} className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Pedidos recientes">
          {data.recentOrders.length === 0 ? (
            <EmptyState message="No hay pedidos recientes." />
          ) : (
            <div className="space-y-2.5">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="group flex items-center justify-between gap-4 p-3 border border-slate-100 hover:border-slate-200/70 hover:bg-slate-50/40 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 group-hover:text-primary transition-colors">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-950 font-heading">
                      {formatCurrency(order.totalInCents)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
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
            <div className="space-y-2.5">
              {data.lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3 border border-slate-100 hover:border-slate-200/70 hover:bg-slate-50/40 rounded-xl transition-all duration-200 shadow-xs hover:shadow-sm"
                >
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-xs font-bold text-red-600 bg-red-50/80 border border-red-100 px-2.5 py-1 rounded-full">
                    {item.currentStock} / mín. {item.minStock} {item.unit?.symbol}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}
