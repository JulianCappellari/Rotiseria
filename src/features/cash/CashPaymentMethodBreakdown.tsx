"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  QrCode,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import {
  getCashSessions,
  getOpenCashSession,
} from "@/features/cash/cash.service"
import { getPaymentMethodLabel } from "@/lib/display-labels"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import { CashSession } from "@/types/cash-session"

const PAYMENT_METHODS = [
  {
    id: "CASH",
    Icon: Banknote,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    id: "TRANSFER",
    Icon: Landmark,
    tone: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    id: "DEBIT",
    Icon: CreditCard,
    tone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  {
    id: "CREDIT",
    Icon: CreditCard,
    tone: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    id: "QR",
    Icon: QrCode,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    id: "MERCADO_PAGO",
    Icon: Smartphone,
    tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
] as const

function sumAmounts(amounts: Record<string, number> | null | undefined) {
  return PAYMENT_METHODS.reduce(
    (total, method) => total + Number(amounts?.[method.id] ?? 0),
    0,
  )
}

function getOpeningOperator(session: CashSession) {
  return session.openedByName?.trim() || session.openedByUser?.name || "Sin registrar"
}

function getClosingOperator(session: CashSession) {
  if (!session.closedAt) return null
  return session.closedByName?.trim() || session.closedByUser?.name || "Sin registrar"
}

async function getCashSummarySession(): Promise<CashSession | null> {
  const openSession = await getOpenCashSession()

  if (openSession) {
    return openSession
  }

  const sessions = await getCashSessions()
  return sessions[0] ?? null
}

export function CashPaymentMethodBreakdown() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["cash-sessions", "method-breakdown"],
    queryFn: getCashSummarySession,
  })

  const breakdown = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        ...method,
        label: getPaymentMethodLabel(method.id),
        openingInCents: session?.openingAmountsInCents?.[method.id] ?? 0,
        paymentsInCents: session?.paymentAmountsInCents?.[method.id] ?? 0,
        expensesInCents: session?.expenseAmountsInCents?.[method.id] ?? 0,
        netInCents: session?.netAmountsInCents?.[method.id] ?? 0,
        expectedInCents:
          session?.currentExpectedAmountsInCents?.[method.id] ??
          session?.expectedAmountsInCents?.[method.id] ??
          0,
      })),
    [session],
  )

  const openingTotalInCents = sumAmounts(session?.openingAmountsInCents)
  const paymentsTotalInCents =
    session?.paymentsTotalInCents ?? sumAmounts(session?.paymentAmountsInCents)
  const expensesTotalInCents =
    session?.expensesTotalInCents ?? sumAmounts(session?.expenseAmountsInCents)
  const netTotalInCents =
    session?.netTotalInCents ?? paymentsTotalInCents - expensesTotalInCents
  const expectedTotalInCents =
    session?.currentExpectedAmountInCents ??
    sumAmounts(session?.currentExpectedAmountsInCents) ??
    openingTotalInCents + netTotalInCents
  const sessionDate = session?.openedAt
    ? formatDateTime(session.openedAt)
    : null
  const openingOperator = session ? getOpeningOperator(session) : null
  const closingOperator = session ? getClosingOperator(session) : null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Resumen de caja
          </h2>
          <p className="text-sm text-slate-500">
            {sessionDate
              ? `${session?.closedAt ? "Cierre" : "Desde apertura"}: ${sessionDate}`
              : "No hay una caja registrada todavia."}
          </p>
          {session ? (
            <p className="text-xs text-slate-500">
              Abre: {openingOperator}
              {closingOperator ? ` - Cierra: ${closingOperator}` : ""}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md bg-slate-950 px-3 py-2 text-white">
            <p className="text-xs font-medium uppercase text-slate-300">
              Inicial
            </p>
            <p className="text-lg font-semibold">
              {isLoading ? "..." : formatCurrency(openingTotalInCents)}
            </p>
          </div>
          <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
            <p className="text-xs font-medium uppercase">Cobrado</p>
            <p className="text-lg font-semibold">
              {isLoading ? "..." : formatCurrency(paymentsTotalInCents)}
            </p>
          </div>
          <div className="rounded-md bg-red-50 px-3 py-2 text-red-800 ring-1 ring-red-100">
            <p className="text-xs font-medium uppercase">Egresos</p>
            <p className="text-lg font-semibold">
              {isLoading ? "..." : formatCurrency(expensesTotalInCents)}
            </p>
          </div>
          <div className="rounded-md bg-orange-50 px-3 py-2 text-orange-800 ring-1 ring-orange-100">
            <p className="text-xs font-medium uppercase">Ganancia caja</p>
            <p className="text-lg font-semibold">
              {isLoading ? "..." : formatCurrency(netTotalInCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {breakdown.map(
          ({
            id,
            label,
            Icon,
            tone,
            openingInCents,
            paymentsInCents,
            expensesInCents,
            netInCents,
            expectedInCents,
          }) => (
            <div
              key={id}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 ${tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {label}
                  </p>
                  <p className="text-xs text-slate-500">
                    Esperado: {formatCurrency(expectedInCents)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-white px-2 py-1.5">
                  <p className="text-slate-500">Inicial</p>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(openingInCents)}
                  </p>
                </div>
                <div className="rounded-md bg-white px-2 py-1.5">
                  <p className="flex items-center gap-1 text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Cobros
                  </p>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(paymentsInCents)}
                  </p>
                </div>
                <div className="rounded-md bg-white px-2 py-1.5">
                  <p className="flex items-center gap-1 text-red-700">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Egresos
                  </p>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(expensesInCents)}
                  </p>
                </div>
                <div className="rounded-md bg-white px-2 py-1.5">
                  <p className="flex items-center gap-1 text-orange-700">
                    <Wallet className="h-3.5 w-3.5" />
                    Neto
                  </p>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(netInCents)}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {!isLoading && !session ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
          <CircleDollarSign className="h-4 w-4" aria-hidden />
          Abri una caja para ver el resumen del cierre.
        </div>
      ) : null}
    </section>
  )
}
