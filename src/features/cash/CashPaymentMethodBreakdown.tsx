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
} from "lucide-react"

import { api } from "@/lib/api"
import { getPaymentMethodLabel } from "@/lib/display-labels"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

type ApiRecord = Record<string, unknown>

type Payment = {
  id?: string
  orderId?: string
  method?: string | null
  paymentMethod?: string | null
  amountInCents?: number | null
  amount?: number | null
  paidAt?: string | Date | null
  createdAt?: string | Date | null
  status?: string | null
  cashSessionId?: string | null
  cashRegisterSessionId?: string | null
  sessionId?: string | null
}

type OrderWithPayments = {
  id?: string
  payments?: Payment[]
  paymentMethod?: string | null
  paidAmountInCents?: number | null
  amountPaidInCents?: number | null
}

type CashSession = {
  id?: string
  status?: string | null
  openedAt?: string | Date | null
  closedAt?: string | Date | null
  createdAt?: string | Date | null
  payments?: Payment[]
}

type PaymentSummary = {
  totalInCents?: number
  byMethod?: Record<string, number>
  paymentsCount?: number
}

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

function unwrapApiData(value: unknown): unknown {
  if (value && typeof value === "object" && "data" in value) {
    return (value as ApiRecord).data
  }

  return value
}

function getList<T>(value: unknown, keys: string[]): T[] {
  const unwrapped = unwrapApiData(value)

  if (Array.isArray(unwrapped)) {
    return unwrapped as T[]
  }

  if (!unwrapped || typeof unwrapped !== "object") {
    return []
  }

  for (const key of keys) {
    const possibleList = (unwrapped as ApiRecord)[key]

    if (Array.isArray(possibleList)) {
      return possibleList as T[]
    }
  }

  return []
}

async function getApiList<T>(url: string, keys: string[]): Promise<T[]> {
  try {
    return getList<T>(await api.get(url), keys)
  } catch {
    return []
  }
}

function getTime(value: unknown): number | null {
  if (!value || (typeof value !== "string" && !(value instanceof Date))) {
    return null
  }

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function getIsoDate(value: string | Date | null | undefined) {
  if (!value) {
    return null
  }

  return value instanceof Date ? value.toISOString() : value
}

function getPaymentDate(payment: Payment): number | null {
  return getTime(payment.paidAt) ?? getTime(payment.createdAt)
}

function getSessionStart(session?: CashSession | null): number | null {
  return getTime(session?.openedAt) ?? getTime(session?.createdAt)
}

function getSessionEnd(session?: CashSession | null): number | null {
  return getTime(session?.closedAt)
}

function getPaymentSessionId(payment: Payment): string | null {
  return (
    payment.cashSessionId ??
    payment.cashRegisterSessionId ??
    payment.sessionId ??
    null
  )
}

function isOpenSession(session: CashSession): boolean {
  const status = String(session.status ?? "").toUpperCase()
  return status === "OPEN" || status === "ACTIVE" || !session.closedAt
}

function sortSessionsByNewest(sessions: CashSession[]): CashSession[] {
  return [...sessions].sort((left, right) => {
    const rightTime = getSessionStart(right) ?? 0
    const leftTime = getSessionStart(left) ?? 0

    return rightTime - leftTime
  })
}

function getCurrentSession(sessions: CashSession[]): CashSession | null {
  const sortedSessions = sortSessionsByNewest(sessions)
  return sortedSessions.find(isOpenSession) ?? sortedSessions[0] ?? null
}

function isActivePayment(payment: Payment): boolean {
  const status = String(payment.status ?? "ACTIVE").toUpperCase()
  return !["CANCELLED", "CANCELED", "VOID", "VOIDED", "DELETED"].includes(status)
}

function getPaymentAmountInCents(payment: Payment): number {
  if (typeof payment.amountInCents === "number") {
    return payment.amountInCents
  }

  if (typeof payment.amount === "number") {
    return payment.amount
  }

  return 0
}

function normalizePaymentMethod(method: unknown): string {
  const normalized = String(method ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")

  const aliases: Record<string, string> = {
    CASH: "CASH",
    EFECTIVO: "CASH",
    TRANSFER: "TRANSFER",
    TRANSFERENCIA: "TRANSFER",
    BANK_TRANSFER: "TRANSFER",
    DEBIT: "DEBIT",
    DEBITO: "DEBIT",
    DEBIT_CARD: "DEBIT",
    CREDIT: "CREDIT",
    CREDITO: "CREDIT",
    CREDIT_CARD: "CREDIT",
    QR: "QR",
    MP: "MERCADO_PAGO",
    MERCADOPAGO: "MERCADO_PAGO",
    MERCADO_PAGO: "MERCADO_PAGO",
  }

  return aliases[normalized] ?? normalized
}

function getPaymentMethod(payment: Payment): string {
  return normalizePaymentMethod(payment.method ?? payment.paymentMethod)
}

function getPaymentsFromOrders(
  orders: OrderWithPayments[],
  includeOrderTotals: boolean,
): Payment[] {
  return orders.flatMap((order) => {
    if (order.payments?.length) {
      return order.payments.map((payment) => ({
        ...payment,
        orderId: payment.orderId ?? order.id,
      }))
    }

    if (!includeOrderTotals) {
      return []
    }

    const paidAmountInCents =
      order.paidAmountInCents ?? order.amountPaidInCents ?? 0

    if (!order.paymentMethod || paidAmountInCents <= 0) {
      return []
    }

    return [
      {
        orderId: order.id,
        method: order.paymentMethod,
        amountInCents: paidAmountInCents,
      },
    ]
  })
}

function getPaymentsFromSessions(sessions: CashSession[]): Payment[] {
  return sessions.flatMap((session) =>
    (session.payments ?? []).map((payment) => ({
      ...payment,
      cashSessionId: payment.cashSessionId ?? session.id,
    })),
  )
}

function dedupePayments(payments: Payment[]): Payment[] {
  const seen = new Set<string>()

  return payments.filter((payment, index) => {
    const key =
      payment.id ??
      `${payment.orderId ?? "sin-pedido"}-${getPaymentMethod(payment)}-${getPaymentAmountInCents(payment)}-${getPaymentDate(payment) ?? index}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function filterPaymentsBySession(
  payments: Payment[],
  session: CashSession | null,
): Payment[] {
  const activePayments = payments.filter(isActivePayment)

  if (!session) {
    return activePayments
  }

  const sessionIdMatches = activePayments.filter(
    (payment) => getPaymentSessionId(payment) === session.id,
  )

  if (sessionIdMatches.length > 0) {
    return sessionIdMatches
  }

  const sessionStart = getSessionStart(session)

  if (!sessionStart) {
    return activePayments
  }

  const sessionEnd = getSessionEnd(session)
  const dateMatches = activePayments.filter((payment) => {
    const paidAt = getPaymentDate(payment)

    if (!paidAt) {
      return true
    }

    return paidAt >= sessionStart && (!sessionEnd || paidAt <= sessionEnd)
  })

  return dateMatches.length > 0 ? dateMatches : activePayments
}

async function getPaymentSummary(
  session: CashSession | null,
): Promise<PaymentSummary | null> {
  try {
    const params = new URLSearchParams()
    const from = getIsoDate(session?.openedAt ?? session?.createdAt ?? null)
    const to = getIsoDate(session?.closedAt ?? null)

    if (from) {
      params.set("from", from)
    }

    if (to) {
      params.set("to", to)
    }

    const queryString = params.toString()
    const response = await api.get(
      queryString ? `/payments/summary?${queryString}` : "/payments/summary",
    )

    return unwrapApiData(response) as PaymentSummary
  } catch {
    return null
  }
}

async function getPaymentMethodData() {
  const sessions = await getApiList<CashSession>("/cash-sessions", [
    "sessions",
    "items",
    "data",
  ])
  const currentSession = getCurrentSession(sessions)
  const summary = await getPaymentSummary(currentSession)
  const [payments, orders] = await Promise.all([
    getApiList<Payment>("/payments", ["payments", "items", "data"]),
    getApiList<OrderWithPayments>("/orders", ["orders", "items", "data"]),
  ])
  const paymentsFromSessions = getPaymentsFromSessions(sessions)
  const ordersHaveEmbeddedPayments = orders.some((order) => order.payments?.length)
  const includeOrderTotals =
    payments.length === 0 &&
    paymentsFromSessions.length === 0 &&
    !ordersHaveEmbeddedPayments
  const allPayments = dedupePayments([
    ...payments,
    ...getPaymentsFromOrders(orders, includeOrderTotals),
    ...paymentsFromSessions,
  ])
  const sessionPayments = filterPaymentsBySession(allPayments, currentSession)

  return {
    currentSession,
    payments: sessionPayments,
    summary,
  }
}

export function CashPaymentMethodBreakdown() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments", "cash-method-breakdown"],
    queryFn: getPaymentMethodData,
  })

  const payments = data?.payments ?? []
  const summaryByMethod = data?.summary?.byMethod
  const breakdown = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        ...method,
        label: getPaymentMethodLabel(method.id),
        amountInCents:
          summaryByMethod?.[method.id] ??
          payments.reduce((total, payment) => {
            return getPaymentMethod(payment) === method.id
              ? total + getPaymentAmountInCents(payment)
              : total
          }, 0),
      })),
    [payments, summaryByMethod],
  )
  const totalAmountInCents =
    data?.summary?.totalInCents ??
    breakdown.reduce((total, item) => total + item.amountInCents, 0)
  const sessionStart =
    data?.currentSession?.openedAt ?? data?.currentSession?.createdAt ?? null
  const sessionStartLabel = sessionStart
    ? formatDateTime(
        sessionStart instanceof Date ? sessionStart.toISOString() : sessionStart,
      )
    : null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Cobros por metodo
          </h2>
          <p className="text-sm text-slate-500">
            {sessionStartLabel
              ? `Desde apertura: ${sessionStartLabel}`
              : "Pagos registrados en caja"}
          </p>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 text-right text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Total cobrado
          </p>
          <p className="text-lg font-semibold">
            {isLoading ? "..." : formatCurrency(totalAmountInCents)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {breakdown.map(({ id, label, Icon, tone, amountInCents }) => (
          <div
            key={id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 ${tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="truncate text-sm font-medium text-slate-700">
                {label}
              </span>
            </div>
            <span className="shrink-0 text-base font-semibold text-slate-950">
              {isLoading ? "..." : formatCurrency(amountInCents)}
            </span>
          </div>
        ))}
      </div>

      {!isLoading && totalAmountInCents === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
          <CircleDollarSign className="h-4 w-4" aria-hidden />
          Todavia no hay cobros para separar por metodo.
        </div>
      ) : null}
    </section>
  )
}
