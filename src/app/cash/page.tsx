"use client";

import { Fragment, useState } from "react";
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
import { getPaymentMethodLabel } from "@/lib/display-labels";
import { CashPaymentMethodBreakdown } from "@/features/cash/CashPaymentMethodBreakdown";
import {
  getActualCashClosingInCents,
  getCashControlDifferenceInCents,
  getCashDifferenceInCents,
  getExpectedCashClosingInCents,
} from "@/lib/cash-calculations";
import type { CashSession } from "@/types/cash-session";

const PAYMENT_METHODS = [
  "CASH",
  "TRANSFER",
  "DEBIT",
  "CREDIT",
  "QR",
  "MERCADO_PAGO",
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];
type MethodInputs = Record<PaymentMethod, string>;
type MethodAmounts = Record<PaymentMethod, number>;

function createEmptyMethodInputs(): MethodInputs {
  return PAYMENT_METHODS.reduce((inputs, method) => {
    inputs[method] = "";
    return inputs;
  }, {} as MethodInputs);
}

function toCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const numberValue = Number(normalized || 0);
  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.round(numberValue * 100)
    : 0;
}

function inputsToAmounts(inputs: MethodInputs): MethodAmounts {
  return PAYMENT_METHODS.reduce((amounts, method) => {
    amounts[method] = toCents(inputs[method]);
    return amounts;
  }, {} as MethodAmounts);
}

function sumMethodAmounts(amounts: Record<string, number> | null | undefined) {
  return PAYMENT_METHODS.reduce(
    (total, method) => total + Number(amounts?.[method] ?? 0),
    0,
  );
}

function getSessionAmounts(
  amounts: Record<string, number> | null | undefined,
  fallbackInCents: number | null | undefined,
) {
  if (amounts) return amounts;
  return { CASH: fallbackInCents ?? 0 };
}

function getMethodOpeningClosingDifference(
  openingAmounts: Record<string, number>,
  closingAmounts: Record<string, number>,
  method: PaymentMethod,
) {
  return Number(closingAmounts[method] ?? 0) - Number(openingAmounts[method] ?? 0);
}

function getOpeningOperator(session: CashSession) {
  return session.openedByName?.trim() || session.openedByUser?.name || "Sin registrar";
}

function getClosingOperator(session: CashSession) {
  if (!session.closedAt) return "Caja abierta";
  return session.closedByName?.trim() || session.closedByUser?.name || "Sin registrar";
}

export default function CashPage() {
  const queryClient = useQueryClient();

  const [openingByName, setOpeningByName] = useState("");
  const [closingByName, setClosingByName] = useState("");
  const [openingAmounts, setOpeningAmounts] = useState<MethodInputs>(() =>
    createEmptyMethodInputs(),
  );
  const [closingAmounts, setClosingAmounts] = useState<MethodInputs>(() =>
    createEmptyMethodInputs(),
  );

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
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Caja abierta");
      setOpeningByName("");
      setOpeningAmounts(createEmptyMethodInputs());
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo abrir caja"));
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => {
      const amounts = inputsToAmounts(closingAmounts);

      return closeCashSession(openSession!.id, {
        closingAmountInCents: sumMethodAmounts(amounts),
        closingAmountsInCents: amounts,
        closedByName: closingByName.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-session-open"] });
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Caja cerrada");
      setClosingByName("");
      setClosingAmounts(createEmptyMethodInputs());
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo cerrar caja"));
    },
  });

  function handleOpen() {
    const openedByName = openingByName.trim();

    if (!openedByName) {
      toast.error("Ingresá el nombre de quien abre la caja");
      return;
    }

    const amounts = inputsToAmounts(openingAmounts);

    openMutation.mutate({
      openedByName,
      openingAmountInCents: sumMethodAmounts(amounts),
      openingAmountsInCents: amounts,
    });
  }

  function handleClose() {
    if (!closingByName.trim()) {
      toast.error("Ingresá el nombre de quien cierra la caja");
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
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-yellow-700/30 p-4">
                <p className="text-sm text-yellow-100/60">Caja abierta desde</p>
                <p className="font-semibold text-yellow-300">
                  {formatDateTime(openSession.openedAt)}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-700/30 p-4">
                <p className="text-sm text-yellow-100/60">Abierta por</p>
                <p className="font-semibold text-yellow-300">
                  {getOpeningOperator(openSession)}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-700/30 p-4">
                <p className="text-sm text-yellow-100/60">Monto inicial total</p>
                <p className="font-semibold text-yellow-300">
                  {formatCurrency(openSession.openingAmountInCents)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-700/30 p-4">
              <p className="text-sm font-semibold text-yellow-50">
                Monto final contado por metodo
              </p>
              <label className="mt-3 grid max-w-xl gap-1 text-sm text-yellow-100/70">
                Nombre de quien cierra
                <Input
                  value={closingByName}
                  onChange={(event) => setClosingByName(event.target.value)}
                  placeholder="Ej: Juan Perez"
                />
              </label>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method} className="grid gap-1 text-sm text-yellow-100/70">
                    {getPaymentMethodLabel(method)}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={closingAmounts[method]}
                      onChange={(event) =>
                        setClosingAmounts((current) => ({
                          ...current,
                          [method]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-lg bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-yellow-100/70">
                  Total contado al cierre
                </span>
                <strong className="text-lg text-yellow-300">
                  {formatCurrency(sumMethodAmounts(inputsToAmounts(closingAmounts)))}
                </strong>
                <Button onClick={handleClose} disabled={closeMutation.isPending}>
                  {closeMutation.isPending ? "Cerrando..." : "Cerrar caja"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-700/30 p-4">
            <p className="text-sm font-semibold text-yellow-50">
              Monto inicial por metodo
            </p>
            <label className="mt-3 grid max-w-xl gap-1 text-sm text-yellow-100/70">
              Nombre de quien abre
              <Input
                value={openingByName}
                onChange={(event) => setOpeningByName(event.target.value)}
                placeholder="Ej: Maria Gomez"
              />
            </label>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="grid gap-1 text-sm text-yellow-100/70">
                  {getPaymentMethodLabel(method)}
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={openingAmounts[method]}
                    onChange={(event) =>
                      setOpeningAmounts((current) => ({
                        ...current,
                        [method]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-lg bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-yellow-100/70">
                Total inicial
              </span>
              <strong className="text-lg text-yellow-300">
                {formatCurrency(sumMethodAmounts(inputsToAmounts(openingAmounts)))}
              </strong>
              <Button onClick={handleOpen} disabled={openMutation.isPending}>
                {openMutation.isPending ? "Abriendo..." : "Abrir caja"}
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      <CashPaymentMethodBreakdown />

      <SectionCard title="Historial de caja">
        {sessions.length === 0 ? (
          <EmptyState message="No hay sesiones de caja registradas." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-yellow-700/40">
            <div className="border-b border-yellow-700/20 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <strong className="text-slate-950">Esperado por sistema</strong> = inicial + cobros - egresos.{" "}
              <strong className="text-slate-950">Diferencia vs apertura</strong> = real contado - inicial.{" "}
              <strong className="text-slate-950">Control</strong> = real contado - esperado por sistema.
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-yellow-700/30">
                  <TableHead className="text-yellow-300">Apertura</TableHead>
                  <TableHead className="text-yellow-300">Cierre</TableHead>
                  <TableHead className="text-yellow-300">Inicial</TableHead>
                  <TableHead className="text-yellow-300">Esperado sistema</TableHead>
                  <TableHead className="text-yellow-300">Real</TableHead>
                  <TableHead className="text-yellow-300">Dif. vs apertura</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sessions.map((session) => {
                  const expectedClosingAmountInCents =
                    getExpectedCashClosingInCents(session);
                  const actualClosingAmountInCents =
                    getActualCashClosingInCents(session);
                  const differenceInCents = getCashDifferenceInCents(session);
                  const controlDifferenceInCents =
                    getCashControlDifferenceInCents(session);
                  const openingByMethod = getSessionAmounts(
                    session.openingAmountsInCents,
                    session.openingAmountInCents,
                  );
                  const expectedByMethod = getSessionAmounts(
                    session.expectedAmountsInCents,
                    session.expectedAmountInCents,
                  );
                  const closingByMethod = getSessionAmounts(
                    session.closingAmountsInCents,
                    session.closingAmountInCents,
                  );

                  return (
                    <Fragment key={session.id}>
                  <TableRow key={session.id} className="border-yellow-700/30">
                    <TableCell>
                      <div className="space-y-1">
                        <p>{formatDateTime(session.openedAt)}</p>
                        <p className="text-xs text-slate-500">
                          {getOpeningOperator(session)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>
                          {session.closedAt ? formatDateTime(session.closedAt) : "Abierta"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getClosingOperator(session)}
                        </p>
                      </div>
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
                      {session.closedAt
                        ? formatCurrency(differenceInCents)
                        : "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-yellow-700/30 bg-slate-50/80">
                    <TableCell colSpan={6}>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span>
                          Abrió:{" "}
                          <strong className="text-slate-950">
                            {getOpeningOperator(session)}
                          </strong>
                        </span>
                        <span>
                          Cerró:{" "}
                          <strong className="text-slate-950">
                            {getClosingOperator(session)}
                          </strong>
                        </span>
                        <span>
                          Inicial:{" "}
                          <strong className="text-slate-950">
                            {formatCurrency(session.openingAmountInCents ?? 0)}
                          </strong>
                        </span>
                        <span>
                          Esperado sistema:{" "}
                          <strong className="text-slate-950">
                            {formatCurrency(expectedClosingAmountInCents)}
                          </strong>
                        </span>
                        <span>
                          Contado:{" "}
                          <strong className="text-slate-950">
                            {formatCurrency(actualClosingAmountInCents)}
                          </strong>
                        </span>
                        <span>
                          Diferencia vs apertura:{" "}
                          <strong
                            className={
                              differenceInCents >= 0
                                ? "text-emerald-700"
                                : "text-red-700"
                            }
                          >
                            {formatCurrency(differenceInCents)}
                          </strong>
                        </span>
                        <span>
                          Control:{" "}
                          <strong
                            className={
                              controlDifferenceInCents === 0
                                ? "text-emerald-700"
                                : "text-red-700"
                            }
                          >
                            {formatCurrency(controlDifferenceInCents)}
                          </strong>
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {PAYMENT_METHODS.map((method) => {
                          const methodDifferenceInCents =
                            getMethodOpeningClosingDifference(
                              openingByMethod,
                              closingByMethod,
                              method,
                            );

                          return (
                            <div
                              key={method}
                              className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600"
                            >
                              <p className="font-semibold text-slate-950">
                                {getPaymentMethodLabel(method)}
                              </p>
                              <div className="mt-2 grid gap-1">
                                <span>
                                  Inicial:{" "}
                                  <strong>{formatCurrency(openingByMethod[method] ?? 0)}</strong>
                                </span>
                                <span>
                                  Esperado sistema:{" "}
                                  <strong>{formatCurrency(expectedByMethod[method] ?? 0)}</strong>
                                </span>
                                <span>
                                  Contado:{" "}
                                  <strong>{formatCurrency(closingByMethod[method] ?? 0)}</strong>
                                </span>
                                <span>
                                  Dif. vs apertura:{" "}
                                  <strong
                                    className={
                                      methodDifferenceInCents >= 0
                                        ? "text-emerald-700"
                                        : "text-red-700"
                                    }
                                  >
                                    {formatCurrency(methodDifferenceInCents)}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
      <BackupPanel />
    </div>
  );
}
