"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handshake, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteSupplier,
  getSuppliers,
} from "@/features/suppliers/supplier.service";
import { SupplierCreateDialog } from "@/features/suppliers/SupplierCreateDialog";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { SupplierEditDialog } from "@/features/suppliers/SupplierEditDialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const { data: suppliers = [], isLoading, isError } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Proveedor eliminado");
      setSupplierToDelete(null);
    },
    onError: () => toast.error("No se pudo eliminar el proveedor"),
  });

  if (isLoading) return <p className="text-yellow-100/60">Cargando proveedores...</p>;
  if (isError) return <p className="text-red-400">Error al cargar proveedores.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Administrá proveedores para compras de insumos."
        action={<SupplierCreateDialog />}
      />

      <SectionCard
        title="Listado de proveedores"
        icon={<Handshake className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30">
                <TableHead className="text-yellow-300">Nombre</TableHead>
                <TableHead className="text-yellow-300">Teléfono</TableHead>
                <TableHead className="text-yellow-300">Dirección</TableHead>
                <TableHead className="text-yellow-300">Estado</TableHead>
                <TableHead className="text-right text-yellow-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-4">
                    <EmptyState message="No hay proveedores cargados." />
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="border-yellow-700/30 hover:bg-yellow-500/5">
                    <TableCell className="font-medium text-yellow-50">{supplier.name}</TableCell>
                    <TableCell className="text-yellow-100/80">{supplier.phone || "-"}</TableCell>
                    <TableCell className="text-yellow-100/80">{supplier.address || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge type="active" value={supplier.isActive} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                      <SupplierEditDialog supplier={supplier} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSupplierToDelete(supplier.id)}
                          className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(supplierToDelete)}
        onOpenChange={(nextOpen) => !nextOpen && setSupplierToDelete(null)}
        title="Eliminar proveedor"
        description="El proveedor no va a aparecer mas en compras nuevas. Si tiene compras historicas, se conserva archivado para no romper reportes."
        confirmLabel="Eliminar"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (supplierToDelete) {
            deleteMutation.mutate(supplierToDelete);
          }
        }}
      />
    </div>
  );
}
