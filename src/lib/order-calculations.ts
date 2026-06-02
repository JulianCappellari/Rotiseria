import { orderStatusLabel, paymentMethodLabel } from "@/lib/business-labels"

export const ORDER_STATUS_ORDER = [
  "PENDING",
  "IN_PREPARATION",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const

export const PAYMENT_METHOD_ORDER = [
  "CASH",
  "TRANSFER",
  "DEBIT",
  "CREDIT",
  "QR",
  "MERCADO_PAGO",
] as const

type PaymentLike = {
  amountInCents: number
  method?: string | null
  status?: string | null
}

type OrderLike = {
  status: string
  totalInCents?: number | null
  paidAmountInCents?: number | null
  payments?: PaymentLike[]
}

export function getOrderStatusCounts(orders: OrderLike[]) {
  const counts = Object.fromEntries(
    ORDER_STATUS_ORDER.map((status) => [status, 0])
  ) as Record<(typeof ORDER_STATUS_ORDER)[number], number>

  for (const order of orders) {
    if (order.status in counts) {
      counts[order.status as keyof typeof counts] += 1
    }
  }

  return ORDER_STATUS_ORDER.map((status) => ({
    label: orderStatusLabel(status),
    status,
    value: counts[status],
  }))
}

export function getOrdersTotalSoldInCents(orders: OrderLike[]) {
  return orders.reduce((total, order) => total + (order.totalInCents ?? 0), 0)
}

export function getOrdersTotalPaidInCents(orders: OrderLike[]) {
  return orders.reduce((total, order) => {
    if (typeof order.paidAmountInCents === "number") {
      return total + order.paidAmountInCents
    }

    return (
      total +
      (order.payments ?? []).reduce((paymentTotal, payment) => {
        if (payment.status === "CANCELLED") return paymentTotal
        return paymentTotal + payment.amountInCents
      }, 0)
    )
  }, 0)
}

export function getPaymentMethodBreakdown(payments: PaymentLike[]) {
  const totals = Object.fromEntries(
    PAYMENT_METHOD_ORDER.map((method) => [method, 0])
  ) as Record<(typeof PAYMENT_METHOD_ORDER)[number], number>

  for (const payment of payments) {
    if (payment.status === "CANCELLED") continue
    if (!payment.method || !(payment.method in totals)) continue

    totals[payment.method as keyof typeof totals] += payment.amountInCents
  }

  return PAYMENT_METHOD_ORDER.map((method) => ({
    label: paymentMethodLabel(method),
    method,
    value: totals[method],
  }))
}

export function getPaymentsFromOrders(orders: OrderLike[]) {
  return orders.flatMap((order) => order.payments ?? [])
}
