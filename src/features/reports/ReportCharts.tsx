"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "@/components/layout/SectionCard";
import { formatCurrency } from "@/lib/formatters";
import { Report } from "@/types/report";

const COLORS = ["#c65f15", "#0f766e", "#2563eb", "#9333ea", "#dc2626"];

function formatCompact(valueInCents: number) {
  const value = valueInCents / 100;

  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function ReportCharts({ report }: { report: Report }) {
  const summaryData = [
    { name: "Ventas", value: report.salesInCents },
    { name: "Cobrado", value: report.paidInCents },
    { name: "Gastos", value: report.expensesInCents },
    { name: "Compras", value: report.purchasesInCents },
    { name: "Neto", value: report.estimatedNetProfitInCents },
  ];

  const expenseData = report.expensesByCategory.map((item) => ({
    name: item.categoryName,
    value: item.totalInCents,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SectionCard title="Balance general">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData} margin={{ top: 20, right: 20, left: 0, bottom: 28 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#475569", fontSize: 12 }}
                interval={0}
                height={48}
                tickMargin={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                tickFormatter={(value) => formatCompact(Number(value))}
                tickLine={false}
                axisLine={false}
                width={65}
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
              <Bar dataKey="value" fill="#c65f15" radius={[6, 6, 0, 0]} maxBarSize={55} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Gastos por categoría">
        {expenseData.length === 0 ? (
          <p className="text-sm text-slate-500">No hay gastos para graficar.</p>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={105}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {expenseData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.14)",
                    color: "#0f172a",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
