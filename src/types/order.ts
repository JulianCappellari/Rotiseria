export type Order = {
  id: string;
  orderNumber: number;
  status: "PENDING" | "IN_PREPARATION" | "READY" | "DELIVERED" | "CANCELLED";
  source: string;
  fulfillmentType: string;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  totalInCents: number;
  paidAmountInCents: number;
  createdAt: string;
  notes?: string | null;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    address?: string | null;
  } | null;
  items: {
    id: string;
    productId: string;
    variantId?: string | null;
    productName: string;
    quantity: string;
    unitPriceInCents: number;
    subtotalInCents: number;
    notes?: string | null;
  }[];
  payments?: {
    id: string;
    method: string;
    amountInCents: number;
    status: "ACTIVE" | "CANCELLED";
    paidAt: string;
    cancelledAt?: string | null;
    cancelReason?: string | null;
    notes?: string | null;
  }[];
  deliveryFeeInCents?: number | null;
  discountInCents?: number | null;
};


export type Payment = {
  id: string;
  orderId: string;
  method: string;
  amountInCents: number;
  status: "ACTIVE" | "CANCELLED";
  paidAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  notes?: string | null;
};
