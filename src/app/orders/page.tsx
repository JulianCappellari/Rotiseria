"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/layout/SearchInput";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdersSummary } from "@/features/orders/OrdersSummary";
import { OrderActions } from "@/features/orders/OrderActions";
import { OrderCreateDialog } from "@/features/orders/OrderCreateDialog";
import { getOrders } from "@/features/orders/order.service";
import { PaymentDialog } from "@/features/payments/PaymentDialog";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/business-labels";
import { getLocalDateKey } from "@/lib/date";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { isOrderPayable } from "@/lib/order-utils";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const businessDate = getLocalDateKey();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", businessDate],
    queryFn: getOrders,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando pedidos...</p>;
  }

  if (isError) {
    return <p className="text-sm font-medium text-red-600">Error al cargar pedidos.</p>;
  }

  const filteredOrders = orders.filter((order) => {
    const searchable = [
      `#${order.orderNumber}`,
      order.customer?.name || "",
      order.status,
      order.paymentStatus,
      orderStatusLabel(order.status),
      paymentStatusLabel(order.paymentStatus),
    ].join(" ");

    const matchesSearch = searchable.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Pedidos del día: estados, cobros y entregas."
        action={<OrderCreateDialog />}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número, cliente, estado o pago..."
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => value && setStatusFilter(value)}
        >
          <SelectTrigger className="h-10 border-slate-200 bg-white text-slate-900 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDING">Pendientes</SelectItem>
            <SelectItem value="IN_PREPARATION">En preparación</SelectItem>
            <SelectItem value="READY">Listos</SelectItem>
            <SelectItem value="DELIVERED">Entregados</SelectItem>
            <SelectItem value="CANCELLED">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OrdersSummary orders={orders} />

      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
            Listado de pedidos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-slate-500"
                    >
                      No hay pedidos para hoy.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-semibold text-orange-700 underline-offset-4 hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer?.name || "Mostrador"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <p key={item.id} className="text-sm text-slate-600">
                              {item.quantity} x {item.productName}
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-950">
                        {formatCurrency(order.totalInCents)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="payment" value={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="order" value={order.status} />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <OrderActions
                            orderId={order.id}
                            currentStatus={order.status}
                          />
                          <PaymentDialog
                            orderId={order.id}
                            suggestedAmountInCents={
                              order.totalInCents - order.paidAmountInCents
                            }
                            disabled={!isOrderPayable(order)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
