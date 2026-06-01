import { Order } from "@/types/order";

export function getOrderPendingAmount(order: Order) {
  return Math.max(order.totalInCents - order.paidAmountInCents, 0);
}

export function isOrderPayable(order: Order) {
  return order.paymentStatus !== "PAID" && order.status !== "CANCELLED";
}