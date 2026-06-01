export function orderStatusLabel(status: string) {
  return {
    PENDING: "Pendiente",
    IN_PREPARATION: "En preparación",
    READY: "Listo",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  }[status] || status;
}

export function paymentStatusLabel(status: string) {
  return {
    UNPAID: "Sin pagar",
    PARTIAL: "Pago parcial",
    PAID: "Pagado",
  }[status] || status;
}

export function paymentMethodLabel(method?: string | null) {
  return {
    CASH: "Efectivo",
    TRANSFER: "Transferencia",
    DEBIT: "Débito",
    CREDIT: "Crédito",
    QR: "QR",
    MERCADO_PAGO: "Mercado Pago",
  }[method || ""] || "-";
}

export function fulfillmentLabel(type: string) {
  return {
    TAKEAWAY: "Retira",
    DINE_IN: "En local",
    DELIVERY: "Delivery",
  }[type] || type;
}

export function sourceLabel(source: string) {
  return {
    COUNTER: "Mostrador",
    WHATSAPP: "WhatsApp",
    PHONE: "Teléfono",
    DELIVERY_APP: "App delivery",
  }[source] || source;
}

export function saleTypeLabel(type: string) {
  return {
    UNIT: "Unidad",
    WEIGHT: "Peso",
    PORTION: "Porción",
  }[type] || type;
}

export function productCategoryTypeLabel(type: string) {
  return {
    FOOD: "Comidas",
    DRINK: "Bebidas",
    COMBO: "Combos",
    OTHER: "Otros",
  }[type] || type;
}

export function inventoryCategoryLabel(category?: string | null) {
  return {
    MEAT: "Carnes",
    COLD_MEAT: "Fiambres",
    DAIRY: "Lácteos",
    VEGETABLE: "Verduras",
    DRY_GOODS: "Secos",
    OIL: "Aceites",
    SAUCE: "Salsas",
    DOUGH: "Masas",
    PACKAGING: "Packaging",
    DRINK: "Bebidas",
    CLEANING: "Limpieza",
    OTHER: "Otros",
  }[category || ""] || category || "-";
}

export function stockMovementTypeLabel(type: string) {
  return {
    INITIAL: "Stock inicial",
    PURCHASE: "Compra",
    SALE_CONSUMPTION: "Consumo por pedido",
    ADJUSTMENT_IN: "Ajuste positivo",
    ADJUSTMENT_OUT: "Ajuste negativo",
    WASTE: "Desperdicio",
    RETURN: "Devolución",
  }[type] || type;
}

export function paymentRecordStatusLabel(status: string) {
  return {
    ACTIVE: "Activo",
    CANCELLED: "Cancelado",
  }[status] || status;
}
