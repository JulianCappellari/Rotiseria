"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";

import { getOrderById } from "@/features/orders/order.service";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { LoadingState } from "@/components/layout/LoadingState";
import { ErrorState } from "@/components/layout/ErrorState";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { EmptyState } from "@/components/layout/EmptyState";
import { OrderDetailActions } from "@/features/orders/OrderDetailActions";
import { Badge } from "@/components/ui/badge";

import {
  fulfillmentLabel,
  paymentMethodLabel,
  sourceLabel,
} from "@/lib/business-labels";
import { CancelPaymentDialog } from "@/features/payments/CancelPaymentDialog";
import { OrderEditDialog } from "@/features/orders/OrderEditDialog";

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    refetchOnMount: true,
  });

  if (isLoading) return <LoadingState message="Cargando pedido..." />;

  if (isError || !order) {
    return <ErrorState message="No se pudo cargar el pedido." />;
  }

  const pendingAmount = Math.max(
    order.totalInCents - order.paidAmountInCents,
    0,
  );

  const hasDelivery =
    order.deliveryFeeInCents != null && order.deliveryFeeInCents > 0;

  const hasDiscount =
    order.discountInCents != null && order.discountInCents > 0;

  const isDeliveryOrder = order.fulfillmentType === "DELIVERY";
  const deliveryAddress = order.customer?.address?.trim();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Pedido #${order.orderNumber}`}
        description={`Creado el ${formatDateTime(order.createdAt)}`}
        backHref="/orders"
        action={
          <div className="flex flex-wrap gap-2">
            <OrderEditDialog order={order} />
            <OrderDetailActions order={order} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Cliente">
          <p className="text-yellow-50">
            {order.customer?.name || "Mostrador"}
          </p>
          <p className="text-sm text-yellow-100/60">
            {order.customer?.phone || "Sin teléfono"}
          </p>
          {order.customer?.address && (
            <p className="mt-1 text-sm text-yellow-100/60">
              {order.customer.address}
            </p>
          )}
        </SectionCard>

        <SectionCard title="Estado">
          <StatusBadge type="order" value={order.status} />
        </SectionCard>

        <SectionCard title="Pago">
          <StatusBadge type="payment" value={order.paymentStatus} />
          <p className="mt-3 text-yellow-300">
            {formatCurrency(order.paidAmountInCents)} /{" "}
            {formatCurrency(order.totalInCents)}
          </p>
        </SectionCard>
      </div>

      <SectionCard title="Información del pedido">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-yellow-100/60">Origen</p>
            <p className="font-medium text-yellow-300">
              {sourceLabel(order.source)}
            </p>
          </div>

          <div>
            <p className="text-sm text-yellow-100/60">Entrega</p>
            <p className="font-medium text-yellow-300">
              {fulfillmentLabel(order.fulfillmentType)}
            </p>
          </div>

          <div>
            <p className="text-sm text-yellow-100/60">Delivery</p>
            <p className="font-medium text-yellow-300">
              {hasDelivery
                ? formatCurrency(order.deliveryFeeInCents!)
                : "Sin delivery"}
            </p>
          </div>
        </div>

        {isDeliveryOrder && (
          <div className="mt-4 rounded-xl border border-yellow-700/30 bg-black/40 p-4">
            <p className="text-sm text-yellow-100/60">
              Direccion de entrega
            </p>
            <p className="mt-1 font-medium text-yellow-50">
              {deliveryAddress || "Sin direccion cargada"}
            </p>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-yellow-700/30 bg-black/40 p-4">
          <p className="text-sm text-yellow-100/60">Notas / indicaciones</p>
          <p className="mt-1 text-yellow-50">
            {order.notes?.trim() ? order.notes : "Sin notas"}
          </p>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <SectionCard
          title="Productos"
          icon={<ShoppingBag className="h-5 w-5 text-yellow-300" />}
        >
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded-xl border border-yellow-700/30 p-3"
              >
                <div>
                  <p className="font-medium text-yellow-50">
                    {item.productName}
                  </p>
                  <p className="text-sm text-yellow-100/60">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-yellow-300">
                    {formatCurrency(item.subtotalInCents)}
                  </p>
                  <p className="text-xs text-yellow-100/50">
                    Unitario: {formatCurrency(item.unitPriceInCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Resumen">
          <div className="space-y-3 text-yellow-100/80">
            <div className="flex justify-between">
              <span>Delivery</span>
              <strong>
                {hasDelivery ? formatCurrency(order.deliveryFeeInCents!) : "-"}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Descuento</span>
              <strong>
                {hasDiscount
                  ? `-${formatCurrency(order.discountInCents!)}`
                  : "-"}
              </strong>
            </div>

            <div className="flex justify-between border-t border-yellow-700/30 pt-3">
              <span>Total</span>
              <strong className="text-yellow-300">
                {formatCurrency(order.totalInCents)}
              </strong>
            </div>

            <div className="flex justify-between">
              <span>Pagado</span>
              <strong>{formatCurrency(order.paidAmountInCents)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Pendiente</span>
              <strong className={pendingAmount > 0 ? "text-red-300" : ""}>
                {formatCurrency(pendingAmount)}
              </strong>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Pagos registrados">
        {!order.payments || order.payments.length === 0 ? (
          <EmptyState message="Este pedido todavía no tiene pagos registrados." />
        ) : (
          <div className="space-y-3">
            {order.payments.map((payment) => {
              const isCancelled = payment.status === "CANCELLED";

              return (
                <div
                  key={payment.id}
                  className={`rounded-xl border p-3 ${
                    isCancelled
                      ? "border-red-500/40 bg-red-500/5 opacity-75"
                      : "border-yellow-700/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-yellow-50">
                          {paymentMethodLabel(payment.method)}
                        </p>

                        <Badge
                          variant={isCancelled ? "destructive" : "secondary"}
                        >
                          {isCancelled ? "Cancelado" : "Activo"}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-yellow-100/60">
                        {formatDateTime(payment.paidAt)}
                      </p>

                      {payment.notes && (
                        <p className="mt-1 text-sm text-yellow-100/60">
                          Nota: {payment.notes}
                        </p>
                      )}

                      {isCancelled && payment.cancelReason && (
                        <p className="mt-1 text-sm text-red-300">
                          Motivo: {payment.cancelReason}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isCancelled
                            ? "text-red-300 line-through"
                            : "text-yellow-300"
                        }`}
                      >
                        {formatCurrency(payment.amountInCents)}
                      </p>

                      {!isCancelled && (
                        <div className="mt-2">
                          <CancelPaymentDialog
                            paymentId={payment.id}
                            orderId={order.id}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
