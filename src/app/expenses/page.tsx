"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";

import { getExpenses } from "@/features/expenses/expense.service";
import { ExpenseCreateDialog } from "@/features/expenses/ExpenseCreateDialog";
import { getLocalDateKey } from "@/lib/date";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function getPaymentLabel(method?: string | null) {
  const labels: Record<string, string> = {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    DEBIT: "Débito",
    CREDIT: "Crédito",
    QR: "QR",
    MERCADO_PAGO: "Mercado Pago",
  };

  return method ? labels[method] || method : "-";
}

export default function ExpensesPage() {
  const [businessDate, setBusinessDate] = useState(getLocalDateKey());
  const {
    data: expenses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses", businessDate],
    queryFn: () => getExpenses(businessDate),
  });

  if (isLoading) {
    return <p className="text-yellow-100/60">Cargando gastos...</p>;
  }

  if (isError) {
    return <p className="text-red-400">Error al cargar gastos.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Registrá y controlá los egresos de la rotisería."
        action={<ExpenseCreateDialog />}
      />

      <input
        type="date"
        value={businessDate}
        onChange={(event) => setBusinessDate(event.target.value)}
        className="h-10 w-full max-w-[220px] rounded-lg border border-yellow-700/40 bg-black/20 px-3 text-sm text-yellow-50 outline-none ring-yellow-500 transition focus:ring-2"
      />

      <SectionCard
        title="Listado de gastos"
        icon={<ReceiptText className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30 hover:bg-transparent">
                <TableHead className="text-yellow-300">Descripción</TableHead>
                <TableHead className="text-yellow-300">Categoría</TableHead>
                <TableHead className="text-yellow-300">Método</TableHead>
                <TableHead className="text-yellow-300">Monto</TableHead>
                <TableHead className="text-yellow-300">Fecha</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {expenses.length === 0 ? (
                <TableRow className="border-yellow-700/30">
                  <TableCell colSpan={5} className="p-4">
                    <EmptyState message="No hay gastos registrados." />
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="border-yellow-700/30 hover:bg-yellow-500/5"
                  >
                    <TableCell>
                      <p className="font-medium text-yellow-50">
                        {expense.description}
                      </p>
                    </TableCell>

                    <TableCell className="text-yellow-100/80">
                      {expense.category?.name || "Sin categoría"}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-yellow-500 text-black">
                        {getPaymentLabel(expense.paymentMethod)}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-semibold text-yellow-50">
                      {formatCurrency(expense.amountInCents)}
                    </TableCell>

                    <TableCell className="text-yellow-100/70">
                      {formatDateTime(expense.businessDate)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
