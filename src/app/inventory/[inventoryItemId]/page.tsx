"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Boxes, History } from "lucide-react";

import {
  getInventoryItem,
  getInventoryItemMovements,
} from "@/features/inventory/inventory.service";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatCurrency } from "@/lib/formatters";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryEditDialog } from "@/features/inventory/InventoryEditDialog";

const movementLabels: Record<string, string> = {
  INITIAL: "Stock inicial",
  PURCHASE: "Compra",
  SALE_CONSUMPTION: "Consumo por pedido",
  ADJUSTMENT_IN: "Ajuste positivo",
  ADJUSTMENT_OUT: "Ajuste negativo",
  WASTE: "Desperdicio",
  RETURN: "Devolución",
};

const outTypes = ["SALE_CONSUMPTION", "ADJUSTMENT_OUT", "WASTE"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InventoryDetailPage() {
  const params = useParams();
  const inventoryItemId = params.inventoryItemId as string;

  const itemQuery = useQuery({
    queryKey: ["inventory-item", inventoryItemId],
    queryFn: () => getInventoryItem(inventoryItemId),
  });

  const movementsQuery = useQuery({
    queryKey: ["inventory-movements", inventoryItemId],
    queryFn: () => getInventoryItemMovements(inventoryItemId),
  });

  if (itemQuery.isLoading || movementsQuery.isLoading) {
    return <p className="text-yellow-100/60">Cargando detalle de stock...</p>;
  }

  if (itemQuery.isError || movementsQuery.isError || !itemQuery.data) {
    return (
      <p className="text-red-400">Error al cargar el detalle del insumo.</p>
    );
  }

  const item = itemQuery.data;
  const movements = movementsQuery.data ?? [];
  const isLowStock = Number(item.currentStock) <= Number(item.minStock);

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description="Detalle del insumo e historial completo de movimientos."
        action={
          <div className="flex flex-wrap gap-2">
            <InventoryEditDialog item={item} />

            <Link
              href="/inventory"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-yellow-700/60 px-4 text-sm font-medium text-yellow-100 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard
          title="Stock actual"
          icon={<Boxes className="h-5 w-5 text-yellow-300" />}
        >
          <p className="text-3xl font-bold text-yellow-50">
            {item.currentStock} {item.unit.symbol}
          </p>
        </SectionCard>

        <SectionCard title="Stock mínimo">
          <p className="text-3xl font-bold text-yellow-50">
            {item.minStock} {item.unit.symbol}
          </p>
        </SectionCard>

        <SectionCard title="Costo unitario">
          <p className="text-3xl font-bold text-yellow-50">
            {item.costPerUnitInCents
              ? formatCurrency(item.costPerUnitInCents)
              : "-"}
          </p>
        </SectionCard>

        <SectionCard title="Estado">
          <Badge variant={isLowStock ? "destructive" : "secondary"}>
            {isLowStock ? "Stock bajo" : "Stock correcto"}
          </Badge>
        </SectionCard>
      </div>

      <SectionCard
        title="Historial de movimientos"
        icon={<History className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30 hover:bg-transparent">
                <TableHead className="text-yellow-300">Fecha</TableHead>
                <TableHead className="text-yellow-300">Tipo</TableHead>
                <TableHead className="text-yellow-300">Cantidad</TableHead>
                <TableHead className="text-yellow-300">Antes</TableHead>
                <TableHead className="text-yellow-300">Después</TableHead>
                <TableHead className="text-yellow-300">Motivo</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState message="Este insumo todavía no tiene movimientos." />
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => {
                  const isOut = outTypes.includes(movement.type);

                  return (
                    <TableRow
                      key={movement.id}
                      className="border-yellow-700/30"
                    >
                      <TableCell className="text-yellow-100/80">
                        {formatDate(movement.createdAt)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {movementLabels[movement.type] ?? movement.type}
                        </Badge>
                      </TableCell>

                      <TableCell
                        className={isOut ? "text-red-300" : "text-green-300"}
                      >
                        {isOut ? "-" : "+"}
                        {movement.quantity} {item.unit.symbol}
                      </TableCell>

                      <TableCell className="text-yellow-100/70">
                        {movement.previousStock ?? "-"}
                      </TableCell>

                      <TableCell className="text-yellow-100/70">
                        {movement.newStock ?? "-"}
                      </TableCell>

                      <TableCell className="text-yellow-100/70">
                        {movement.reason || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
