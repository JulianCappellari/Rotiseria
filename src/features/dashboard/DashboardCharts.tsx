"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "@/components/layout/SectionCard";
import { formatCurrency } from "@/lib/formatters";

type Props = {
  salesInCents: number;
  paidInCents: number;
  expensesInCents: number;
  estimatedProfitInCents: number;
};

function formatCompact(valueInCents: number) {
  const value = valueInCents / 100;

  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function DashboardCharts({
  salesInCents,
  paidInCents,
  expensesInCents,
  estimatedProfitInCents,
}: Props) {
  const data = [
    { name: "Ventas", value: salesInCents },
    { name: "Cobrado", value: paidInCents },
    { name: "Gastos", value: expensesInCents },
    { name: "Balance", value: estimatedProfitInCents },
  ];

  return (
    <SectionCard title="Balance del día">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 14, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#475569", fontSize: 12 }}
              tickFormatter={(value) => formatCompact(Number(value))}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 18px 50px rgba(15, 23, 42, 0.14)",
                color: "#0f172a",
              }}
            />
            <Bar dataKey="value" fill="#c65f15" radius={[6, 6, 0, 0]} maxBarSize={54} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
