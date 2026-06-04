"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
            <defs>
              <linearGradient id="gradient-orange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(24 95% 53%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(24 95% 42%)" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 70% 45%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(142 70% 32%)" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 84% 62%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(0 84% 48%)" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200 85% 50%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(200 85% 38%)" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => formatCompact(Number(value))}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              cursor={{ fill: "rgba(24, 95, 53, 0.03)" }}
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
                color: "#0f172a",
                fontFamily: "inherit",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="value" maxBarSize={48} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => {
                let gradientId = "gradient-orange";
                if (entry.name === "Cobrado") gradientId = "gradient-green";
                if (entry.name === "Gastos") gradientId = "gradient-red";
                if (entry.name === "Balance") gradientId = "gradient-blue";
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${gradientId})`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
