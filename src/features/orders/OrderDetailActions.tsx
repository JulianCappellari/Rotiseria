"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

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
      <Link
        href="/orders"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-yellow-700/40 px-4 text-sm font-medium text-yellow-300 hover:bg-yellow-500/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

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