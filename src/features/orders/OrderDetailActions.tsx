"use client";

import { Printer } from "lucide-react";

import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { OrderActions } from "./OrderActions";
import { PaymentDialog } from "@/features/payments/PaymentDialog";

type Props = {
  order: Order;
};

export function OrderDetailActions({ order }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <OrderActions orderId={order.id} currentStatus={order.status} />

      <PaymentDialog
        orderId={order.id}
        disabled={order.paymentStatus === "PAID" || order.status === "CANCELLED"}
      />

      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );
}
