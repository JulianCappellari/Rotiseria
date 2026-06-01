"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Boxes } from "lucide-react";

import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/layout/SearchInput";
import { SectionCard } from "@/components/layout/SectionCard";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryCreateDialog } from "@/features/inventory/InventoryCreateDialog";
import { StockMovementDialog } from "@/features/inventory/StockMovementDialog";
import { getInventoryItems } from "@/features/inventory/inventory.service";
import { inventoryCategoryLabel } from "@/lib/business-labels";
import { formatCurrency } from "@/lib/formatters";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventoryItems,
  });

  const filteredItems = items.filter((item) => {
    const searchable = `${item.name} ${item.category} ${inventoryCategoryLabel(item.category)}`;
    const matchesSearch = searchable.toLowerCase().includes(search.toLowerCase());
    const isLowStock = Number(item.currentStock) <= Number(item.minStock);

    return matchesSearch && (!onlyLowStock || isLowStock);
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando stock...</p>;
  }

  if (isError) {
    return <p className="text-sm font-medium text-red-600">Error al cargar stock.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock"
        description="Control de insumos, mínimos y estado del inventario."
        action={
          <>
            <InventoryCreateDialog />
            <StockMovementDialog />
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar insumo o categoría..."
        />

        <Button
          variant={onlyLowStock ? "default" : "outline"}
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className="h-10"
        >
          Solo stock bajo
        </Button>
      </div>

      <SectionCard
        title="Inventario"
        icon={<Boxes className="h-5 w-5 text-orange-600" />}
      >
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Insumo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock actual</TableHead>
                <TableHead>Stock mínimo</TableHead>
                <TableHead>Costo unitario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-4">
                    <EmptyState message="No hay insumos que coincidan con la búsqueda." />
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock =
                    Number(item.currentStock) <= Number(item.minStock);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-950">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {inventoryCategoryLabel(item.category)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.currentStock} {item.unit?.symbol}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.minStock} {item.unit?.symbol}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.costPerUnitInCents
                          ? formatCurrency(item.costPerUnitInCents)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.isPerishable ? (
                          <Badge
                            variant="outline"
                            className="border-sky-200 bg-sky-50 text-sky-700"
                          >
                            Perecedero
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-700"
                          >
                            No perecedero
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="stock" value={isLowStock} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          Ver detalle
                        </Link>
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
