"use client";

import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { getCustomers } from "@/features/customers/customer.service";
import { CustomerCreateDialog } from "@/features/customers/CustomerCreateDialog";

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
import { useState } from "react";
import { SearchInput } from "@/components/layout/SearchInput";
import { CustomerEditDialog } from "@/features/customers/CustomerEditDialog";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const {
    data: customers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  if (isLoading)
    return <p className="text-yellow-100/60">Cargando clientes...</p>;
  if (isError) return <p className="text-red-400">Error al cargar clientes.</p>;
  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone || ""} ${customer.address || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Administrá clientes para pedidos por delivery, WhatsApp o teléfono."
        action={<CustomerCreateDialog />}
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cliente, teléfono o dirección..."
      />

      <SectionCard
        title="Listado de clientes"
        icon={<Users className="h-5 w-5 text-yellow-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-yellow-700/40">
          <Table>
            <TableHeader>
              <TableRow className="border-yellow-700/30">
                <TableHead className="text-yellow-300">Nombre</TableHead>
                <TableHead className="text-yellow-300">Teléfono</TableHead>
                <TableHead className="text-yellow-300">Dirección</TableHead>
                <TableHead className="text-yellow-300">Notas</TableHead>
                <TableHead className="text-right text-yellow-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-4">
                    <EmptyState message="No hay clientes cargados." />
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-yellow-700/30 hover:bg-yellow-500/5"
                  >
                    <TableCell className="font-medium text-yellow-50">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-yellow-100/80">
                      {customer.phone || "-"}
                    </TableCell>
                    <TableCell className="text-yellow-100/80">
                      {customer.address || "-"}
                    </TableCell>
                    <TableCell className="text-yellow-100/60">
                      {customer.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CustomerEditDialog customer={customer} />
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
