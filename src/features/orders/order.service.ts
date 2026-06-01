import { api } from "@/lib/api";
import { Order } from "@/types/order";

export type CreateOrderInput = {
  customerId?: string;
  source: "COUNTER" | "WHATSAPP" | "PHONE" | "DELIVERY_APP";
  fulfillmentType: "TAKEAWAY" | "DINE_IN" | "DELIVERY";
  notes?: string;
  discountInCents: number;
  deliveryFeeInCents: number;
  paidAmountInCents: number;
  paymentMethod?: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT" | "QR" | "MERCADO_PAGO";
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

export async function getOrders() {
  const response = await api.get<Order[]>("/orders");
  return response.data;
}

export async function createOrder(data: CreateOrderInput) {
  const response = await api.post<Order>("/orders", data);
  return response.data;
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const response = await api.patch<Order>(`/orders/${id}/status`, { status });
  return response.data;
}

export async function getOrderById(id: string) {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}

export type UpdateOrderItemsInput = {
  discountInCents: number;
  deliveryFeeInCents: number;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    notes?: string;
  }[];
};

export async function updateOrderItems(
  orderId: string,
  data: UpdateOrderItemsInput
) {
  const response = await api.patch(`/orders/${orderId}/items`, data);
  return response.data;
}