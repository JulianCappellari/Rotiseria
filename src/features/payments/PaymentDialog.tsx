"use client"

import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Ban, Banknote, CheckCircle2 } from "lucide-react"

import { api } from "@/lib/api"
import { getPaymentMethodLabel } from "@/lib/display-labels"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type PaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "DEBIT"
  | "CREDIT"
  | "QR"
  | "MERCADO_PAGO"

type Payment = {
  id: string
  method: PaymentMethod
  amountInCents: number
  paidAt?: string
  createdAt?: string
  status?: string
  notes?: string | null
  cancelReason?: string | null
}

type OrderLike = {
  id: string
  totalInCents: number
  paidAmountInCents?: number | null
  payments?: Payment[]
}

type PaymentDialogProps = {
  orderId?: string
  order?: OrderLike | null
  balanceDueInCents?: number
  pendingAmountInCents?: number
  remainingAmountInCents?: number
  amountDueInCents?: number
  totalPendingInCents?: number
  disabled?: boolean
  children?: ReactNode
  onSuccess?: () => void
  [key: string]: unknown
}

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEBIT", label: "Debito" },
  { value: "CREDIT", label: "Credito" },
  { value: "QR", label: "QR" },
  { value: "MERCADO_PAGO", label: "Mercado Pago" },
]

function unwrapApiData<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }

  return value as T
}

function toCents(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".")
  const numberValue = Number(normalized)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.round(numberValue * 100)
}

function fromCents(value: number): string {
  return String(Math.max(0, value) / 100)
}

function getActivePayments(payments: Payment[]): Payment[] {
  return payments.filter(
    (payment) => String(payment.status ?? "ACTIVE").toUpperCase() !== "CANCELLED",
  )
}

function getPaidAmountInCents(order: OrderLike | null, payments: Payment[]): number {
  if (payments.length > 0) {
    return getActivePayments(payments).reduce(
      (total, payment) => total + payment.amountInCents,
      0,
    )
  }

  return order?.paidAmountInCents ?? 0
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybeResponse = error as {
      response?: { data?: { message?: string } }
      message?: string
    }

    return (
      maybeResponse.response?.data?.message ??
      maybeResponse.message ??
      "No se pudo completar la operacion"
    )
  }

  return "No se pudo completar la operacion"
}

export function PaymentDialog({
  orderId,
  order,
  balanceDueInCents,
  pendingAmountInCents,
  remainingAmountInCents,
  amountDueInCents,
  totalPendingInCents,
  disabled,
  children,
  onSuccess,
}: PaymentDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>("CASH")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const resolvedOrderId = orderId ?? order?.id

  const orderQuery = useQuery({
    queryKey: ["order", resolvedOrderId],
    enabled: open && Boolean(resolvedOrderId) && !order,
    queryFn: async () =>
      unwrapApiData<OrderLike>(await api.get(`/orders/${resolvedOrderId}`)),
  })

  const paymentsQuery = useQuery({
    queryKey: ["payments", "order", resolvedOrderId],
    enabled: open && Boolean(resolvedOrderId),
    queryFn: async () =>
      unwrapApiData<Payment[]>(await api.get(`/payments/order/${resolvedOrderId}`)),
  })

  const resolvedOrder = order ?? orderQuery.data ?? null
  const payments = paymentsQuery.data ?? resolvedOrder?.payments ?? []
  const paidAmountInCents = getPaidAmountInCents(resolvedOrder, payments)
  const knownBalanceInCents =
    balanceDueInCents ??
    pendingAmountInCents ??
    remainingAmountInCents ??
    amountDueInCents ??
    totalPendingInCents
  const balanceInCents =
    knownBalanceInCents ??
    Math.max(0, (resolvedOrder?.totalInCents ?? 0) - paidAmountInCents)
  const paymentAmountInCents = useMemo(() => toCents(amount), [amount])
  const remainingAfterPaymentInCents = Math.max(
    0,
    balanceInCents - paymentAmountInCents,
  )
  const canSubmit =
    Boolean(resolvedOrderId) &&
    paymentAmountInCents > 0 &&
    paymentAmountInCents <= balanceInCents

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] })
    queryClient.invalidateQueries({ queryKey: ["order", resolvedOrderId] })
    queryClient.invalidateQueries({ queryKey: ["payments"] })
    queryClient.invalidateQueries({ queryKey: ["payments", "order", resolvedOrderId] })
    queryClient.invalidateQueries({ queryKey: ["cash"] })
    queryClient.invalidateQueries({ queryKey: ["cash-sessions"] })
  }

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedOrderId) {
        throw new Error("Pedido no encontrado")
      }

      return api.post("/payments", {
        orderId: resolvedOrderId,
        method,
        amountInCents: paymentAmountInCents,
        notes: notes.trim() || undefined,
      })
    },
    onSuccess: () => {
      setAmount("")
      setNotes("")
      setErrorMessage("")
      refreshQueries()
      onSuccess?.()
    },
    onError: (error) => setErrorMessage(getErrorMessage(error)),
  })

  const cancelPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return api.patch(`/payments/${paymentId}/cancel`, {
        reason: cancelReason.trim() || "Cancelado manualmente",
      })
    },
    onSuccess: () => {
      setCancelReason("")
      setErrorMessage("")
      refreshQueries()
      onSuccess?.()
    },
    onError: (error) => setErrorMessage(getErrorMessage(error)),
  })

  const openDialog = () => {
    if (!disabled) {
      setOpen(true)
      setAmount(balanceInCents > 0 ? fromCents(balanceInCents) : "")
      setErrorMessage("")
    }
  }

  const trigger = isValidElement<{ onClick?: () => void; disabled?: boolean }>(
    children,
  )
    ? cloneElement(children, {
        onClick: openDialog,
        disabled,
      })
    : (
      <Button type="button" onClick={openDialog} disabled={disabled}>
        Registrar pago
      </Button>
      )

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!w-[min(96vw,920px)] !max-w-[min(96vw,920px)] max-h-[calc(100vh-1.5rem)] overflow-hidden p-0">
          <DialogHeader>
            <div className="border-b border-slate-200 px-5 py-4">
              <DialogTitle>Registrar pago</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-0 bg-white">
            <section className="min-w-0 border-r border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Banknote className="h-4 w-4" aria-hidden />
                Estado del cobro
              </div>

              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                  <span className="text-sm text-slate-500">Total pedido</span>
                  <strong className="text-slate-950">
                    {formatCurrency(resolvedOrder?.totalInCents ?? 0)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                  <span className="text-sm text-slate-500">Pagado</span>
                  <strong className="text-emerald-700">
                    {formatCurrency(paidAmountInCents)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md bg-slate-950 px-3 py-3 text-white">
                  <span className="text-sm font-medium text-slate-300">
                    Resta pagar
                  </span>
                  <strong className="text-xl">
                    {formatCurrency(balanceInCents)}
                  </strong>
                </div>
              </div>

              {balanceInCents <= 0 ? (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                  Este pedido ya está pagado por completo. Podés revisar o cancelar
                  pagos desde el historial.
                </div>
              ) : null}

              <div className="mt-4 grid gap-2.5">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Metodo
                  <select
                    value={method}
                    onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                    disabled={balanceInCents <= 0}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                  >
                    {PAYMENT_METHODS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Monto
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="decimal"
                    disabled={balanceInCents <= 0}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                  />
                </label>

                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Nota
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    disabled={balanceInCents <= 0}
                    className="resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-950 transition focus:ring-2"
                  />
                </label>

                <div className="rounded-md bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                  <span className="text-slate-500">Resta despues de este pago: </span>
                  <strong className="text-slate-950">
                    {formatCurrency(remainingAfterPaymentInCents)}
                  </strong>
                </div>

                {paymentAmountInCents > balanceInCents ? (
                  <div className="flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    El pago supera el saldo pendiente.
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {errorMessage}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={() => createPaymentMutation.mutate()}
                  disabled={!canSubmit || createPaymentMutation.isPending}
                >
                  {balanceInCents <= 0
                    ? "Pedido pagado"
                    : createPaymentMutation.isPending
                      ? "Registrando..."
                      : "Registrar pago"}
                </Button>
              </div>
            </section>

            <section className="min-w-0 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    Pagos del pedido
                  </h3>
                  <p className="max-w-md text-sm leading-5 text-slate-500">
                    Historial de cobros y cancelaciones sin borrar movimientos.
                  </p>
                </div>
                {balanceInCents <= 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Pagado
                  </span>
                ) : null}
              </div>

              <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                Motivo de cancelacion
                <input
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Ej: importe mal cargado"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                />
              </label>

              <div className="mt-4 max-h-[22rem] overflow-auto rounded-lg border border-slate-200">
                {paymentsQuery.isLoading ? (
                  <div className="p-4 text-sm text-slate-500">Cargando pagos...</div>
                ) : payments.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    Este pedido todavia no tiene pagos registrados.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {payments.map((payment) => {
                      const isCancelled =
                        String(payment.status ?? "ACTIVE").toUpperCase() === "CANCELLED"

                      return (
                        <div
                          key={payment.id}
                          className="grid gap-2 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-slate-950">
                                {formatCurrency(payment.amountInCents)}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {getPaymentMethodLabel(payment.method)}
                              </span>
                              {isCancelled ? (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                                  Cancelado
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 break-words text-xs text-slate-500">
                              {formatDateTime(payment.paidAt ?? payment.createdAt ?? "")}
                              {payment.notes ? ` · ${payment.notes}` : ""}
                              {payment.cancelReason ? ` · ${payment.cancelReason}` : ""}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelPaymentMutation.mutate(payment.id)}
                            disabled={isCancelled || cancelPaymentMutation.isPending}
                          >
                            <Ban className="mr-2 h-4 w-4" aria-hidden />
                            Cancelar
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
