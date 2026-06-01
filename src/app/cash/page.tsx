"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  closeCashSession,
  getCashSessions,
  getOpenCashSession,
  openCashSession,
} from "@/features/cash/cash.service";

import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackupPanel } from "@/features/backups/BackupPanel";
import { getApiErrorMessage } from "@/lib/api-error";

export default function CashPage() {
  const queryClient = useQueryClient();

  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");

  const { data: openSession } = useQuery({
    queryKey: ["cash-session-open"],
    queryFn: getOpenCashSession,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["cash-sessions"],
    queryFn: getCashSessions,
  });

  const openMutation = useMutation({
    mutationFn: openCashSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-session-open"] });
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      toast.success("Caja abierta");
      setOpeningAmount("");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo abrir caja"));
    },
  });

  const closeMutation = useMutation({
    mutationFn: () =>
      closeCashSession(openSession!.id, {
        closingAmountInCents: Math.round(Number(closingAmount) * 100),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-session-open"] });
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Caja cerrada");
      setClosingAmount("");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo cerrar caja"));
    },
  });

  function handleOpen() {
    openMutation.mutate({
      openingAmountInCents: Math.round(Number(openingAmount || 0) * 100),
    });
  }

  function handleClose() {
    if (!closingAmount || Number(closingAmount) < 0) {
      toast.error("Ingresá un monto válido");
      return;
    }

    closeMutation.mutate();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja"
        description="Apertura, cierre y control de caja diaria."
      />

      <SectionCard
        title="Estado de caja"
        icon={<Wallet className="h-5 w-5 text-yellow-300" />}
      >
        {openSession ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-yellow-700/30 p-4">
              <p className="text-sm text-yellow-100/60">Caja abierta desde</p>
              <p className="font-semibold text-yellow-300">
                {formatDateTime(openSession.openedAt)}
              </p>
            </div>

            <div className="rounded-xl border border-yellow-700/30 p-4">
              <p className="text-sm text-yellow-100/60">Monto inicial</p>
              <p className="font-semibold text-yellow-300">
                {formatCurrency(openSession.openingAmountInCents)}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Monto cierre"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
              <Button onClick={handleClose} disabled={closeMutation.isPending}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Monto inicial"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
            />
            <Button onClick={handleOpen} disabled={openMutation.isPending}>
              Abrir caja
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Historial de caja">
        {sessions.length === 0 ? (
          <EmptyState message="No hay sesiones de caja registradas." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-yellow-700/40">
            <Table>
              <TableHeader>
                <TableRow className="border-yellow-700/30">
                  <TableHead className="text-yellow-300">Apertura</TableHead>
                  <TableHead className="text-yellow-300">Cierre</TableHead>
                  <TableHead className="text-yellow-300">Inicial</TableHead>
                  <TableHead className="text-yellow-300">Esperado</TableHead>
                  <TableHead className="text-yellow-300">Real</TableHead>
                  <TableHead className="text-yellow-300">Diferencia</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="border-yellow-700/30">
                    <TableCell>{formatDateTime(session.openedAt)}</TableCell>
                    <TableCell>
                      {session.closedAt ? formatDateTime(session.closedAt) : "Abierta"}
                    </TableCell>
                    <TableCell>{formatCurrency(session.openingAmountInCents)}</TableCell>
                    <TableCell>
                      {session.expectedAmountInCents != null
                        ? formatCurrency(session.expectedAmountInCents)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {session.closingAmountInCents != null
                        ? formatCurrency(session.closingAmountInCents)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {session.differenceInCents != null
                        ? formatCurrency(session.differenceInCents)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
      <BackupPanel />
    </div>
  );
}
