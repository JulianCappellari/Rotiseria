"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createPayment } from "./payment.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "DEBIT"
  | "CREDIT"
  | "QR"
  | "MERCADO_PAGO";

type Props = {
  orderId: string;
  disabled?: boolean;
  suggestedAmountInCents?: number;
};

export function PaymentDialog({
  orderId,
  disabled,
  suggestedAmountInCents,
}: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const suggestedAmount = suggestedAmountInCents
    ? suggestedAmountInCents / 100
    : 0;

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (value && suggestedAmount > 0) {
      setAmount(String(suggestedAmount));
    }
  }

  const mutation = useMutation({
    mutationFn: createPayment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);

      toast.success("Pago registrado");
      setOpen(false);
      setAmount("");
      setMethod("CASH");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo registrar el pago"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Ingresá un monto válido");
      return;
    }

    mutation.mutate({
      orderId,
      method,
      amountInCents: Math.round(Number(amount) * 100),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        disabled={disabled}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-yellow-700/40 px-3 text-sm text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-40"
      >
        <CreditCard className="h-4 w-4" />
        Pagar
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {suggestedAmount > 0 && (
            <div className="rounded-xl border border-yellow-700/40 bg-yellow-500/10 p-3 text-sm text-yellow-100/80">
              Monto pendiente sugerido:{" "}
              <strong className="text-yellow-300">
                ${suggestedAmount.toLocaleString("es-AR")}
              </strong>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Monto</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                suggestedAmount > 0 ? String(suggestedAmount) : "Ej: 5000"
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Método</Label>
            <Select
              value={method}
              onValueChange={(value) => value && setMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="DEBIT">Débito</SelectItem>
                <SelectItem value="CREDIT">Crédito</SelectItem>
                <SelectItem value="QR">QR</SelectItem>
                <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Registrando..." : "Registrar pago"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
