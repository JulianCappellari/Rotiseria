"use client";

import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";

import { getPurchases } from "@/features/purchases/purchase.service";
import { PurchaseCreateDialog } from "@/features/purchases/PurchaseCreateDialog";
import { getLocalDateKey } from "@/lib/date";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/layout/SearchInput";
import { useState } from "react";

export default function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [businessDate, setBusinessDate] = useState(getLocalDateKey());
  const {
    data: purchases = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchases", businessDate],
    queryFn: () => getPurchases(businessDate),
  });

  if (isLoading) {
    return <p className="text-yellow-100/60">Cargando compras...</p>;
  }

  if (isError) {
    return <p className="text-red-400">Error al cargar compras.</p>;
  }

  const filteredPurchases = purchases.filter((purchase) =>
    `${purchase.supplier?.name || ""} ${purchase.invoiceNumber || ""} ${purchase.items
      .map((i) => i.inventoryItem.name)
      .join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Registrá compras de insumos y actualizá stock automáticamente."
        action={<PurchaseCreateDialog />}
      />
      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <input
          type="date"
          value={businessDate}
          onChange={(event) => setBusinessDate(event.target.value)}
          className="h-10 rounded-lg border border-yellow-700/40 bg-black/20 px-3 text-sm text-yellow-50 outline-none ring-yellow-500 transition focus:ring-2"
        />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar proveedor, factura o insumo..."
        />
      </div>

      <SectionCard
        title="Historial de compras"
        icon={<Truck className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30 hover:bg-transparent">
                <TableHead className="text-yellow-300">Proveedor</TableHead>
                <TableHead className="text-yellow-300">Factura</TableHead>
                <TableHead className="text-yellow-300">Insumos</TableHead>
                <TableHead className="text-yellow-300">Total</TableHead>
                <TableHead className="text-yellow-300">Fecha</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow className="border-yellow-700/30">
                  <TableCell colSpan={5} className="p-4">
                    <EmptyState message="No hay compras registradas." />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow
                    key={purchase.id}
                    className="border-yellow-700/30 hover:bg-yellow-500/5"
                  >
                    <TableCell className="font-medium text-yellow-50">
                      {purchase.supplier?.name || "Sin proveedor"}
                    </TableCell>

                    <TableCell className="text-yellow-100/80">
                      {purchase.invoiceNumber || "-"}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {purchase.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            <span className="text-yellow-50">
                              {item.inventoryItem.name}
                            </span>{" "}
                            <span className="text-yellow-100/60">
                              · {item.quantity} {item.inventoryItem.unit.symbol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-yellow-500 text-black">
                        {formatCurrency(purchase.totalInCents)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-yellow-100/70">
                      {formatDateTime(purchase.businessDate)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
