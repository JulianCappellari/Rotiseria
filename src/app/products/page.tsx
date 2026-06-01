"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";

import { getProducts } from "@/features/products/product.service";
import { ProductCreateDialog } from "@/features/products/ProductCreateDialog";
import { ProductActions } from "@/features/products/ProductActions";
import { formatCurrency } from "@/lib/formatters";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { SearchInput } from "@/components/layout/SearchInput";
import { saleTypeLabel } from "@/lib/business-labels";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku || ""} ${product.category?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (isLoading) {
    return <p className="text-yellow-100/60">Cargando productos...</p>;
  }

  if (isError) {
    return <p className="text-red-400">Error al cargar productos.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Administrá los productos que vende la rotisería."
        action={<ProductCreateDialog />}
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar producto, SKU o categoría..."
      />

      <SectionCard
        title="Listado de productos"
        icon={<Package className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30 hover:bg-transparent">
                <TableHead className="text-yellow-300">Producto</TableHead>
                <TableHead className="text-yellow-300">Categoría</TableHead>
                <TableHead className="text-yellow-300">Tipo venta</TableHead>
                <TableHead className="text-yellow-300">Precio</TableHead>
                <TableHead className="text-yellow-300">Costo</TableHead>
                <TableHead className="text-yellow-300">Receta</TableHead>
                <TableHead className="text-yellow-300">Estado</TableHead>
                <TableHead className="text-right text-yellow-300">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow className="border-yellow-700/30">
                  <TableCell colSpan={8} className="p-4">
                    <EmptyState message="No hay productos que coincidan con la búsqueda." />
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-yellow-700/30 hover:bg-yellow-500/5"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-yellow-50">
                          {product.name}
                        </p>
                        <p className="text-xs text-yellow-100/50">
                          {product.sku || "Sin SKU"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-yellow-100/80">
                      {product.category?.name || "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{saleTypeLabel(product.saleType)}</Badge>
                    </TableCell>

                    <TableCell className="font-medium text-yellow-50">
                      {formatCurrency(product.basePriceInCents)}
                    </TableCell>

                    <TableCell className="text-yellow-100/80">
                      {product.costInCents
                        ? formatCurrency(product.costInCents)
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        type="recipe"
                        value={product.isRecipeBased}
                      />
                    </TableCell>

                    <TableCell>
                      <StatusBadge type="active" value={product.isActive} />
                    </TableCell>

                    <TableCell className="text-right">
                      <ProductActions product={product} />
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