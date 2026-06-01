import { api } from "@/lib/api";

export type CreatePaymentInput = {
  orderId: string;
  method: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT" | "QR" | "MERCADO_PAGO";
  amountInCents: number;
  notes?: string;
};

export type CancelPaymentInput = {
  paymentId: string;
  reason?: string;
};

export async function createPayment(data: CreatePaymentInput) {
  const response = await api.post("/payments", data);
  return response.data;
}

export async function cancelPayment({ paymentId, reason }: CancelPaymentInput) {
  const response = await api.delete(`/payments/${paymentId}`, {
    data: { reason },
  });

  return response.data;
}