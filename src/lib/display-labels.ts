const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparacion",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Sin pagar",
  PARTIAL: "Pago parcial",
  PAID: "Pagado",
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  DEBIT: "Debito",
  CREDIT: "Credito",
  QR: "QR",
  MERCADO_PAGO: "Mercado Pago",
}

const SALE_TYPE_LABELS: Record<string, string> = {
  UNIT: "Unidad",
  WEIGHT: "Por peso",
  COMBO: "Combo",
}

const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  WASTE: "Desperdicio",
  ADJUSTMENT: "Ajuste",
  ADJUSTMENT_IN: "Ajuste positivo",
  ADJUSTMENT_OUT: "Ajuste negativo",
  SALE_CONSUMPTION: "Consumo por pedido",
  ORDER_CONSUMPTION: "Consumo por pedido",
  CONSUMPTION: "Consumo",
  RETURN: "Devolucion",
}

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
}

export function getOrderStatusLabel(value: unknown) {
  const normalized = normalize(value)
  return ORDER_STATUS_LABELS[normalized] ?? String(value ?? "")
}

export function getPaymentStatusLabel(value: unknown) {
  const normalized = normalize(value)
  return PAYMENT_STATUS_LABELS[normalized] ?? String(value ?? "")
}

export function getPaymentMethodLabel(value: unknown) {
  const normalized = normalize(value)
  return PAYMENT_METHOD_LABELS[normalized] ?? String(value ?? "")
}

export function getSaleTypeLabel(value: unknown) {
  const normalized = normalize(value)
  return SALE_TYPE_LABELS[normalized] ?? String(value ?? "")
}

export function getStockMovementLabel(value: unknown) {
  const normalized = normalize(value)
  return STOCK_MOVEMENT_LABELS[normalized] ?? String(value ?? "")
}
