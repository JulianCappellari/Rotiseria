"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cancelPayment } from "./payment.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  paymentId: string;
  orderId: string;
};

export function CancelPaymentDialog({ paymentId, orderId }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      cancelPayment({
        paymentId,
        reason: reason || "Pago cargado incorrectamente",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });

      toast.success("Pago cancelado correctamente");
      setOpen(false);
      setReason("");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo cancelar el pago"));
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-red-500/50 px-3 text-xs font-medium text-red-300 hover:bg-red-500/10">
        <Ban className="h-3.5 w-3.5" />
        Cancelar
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Cancelar pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-yellow-100/70">
            El pago no se va a borrar. Quedará marcado como cancelado para mantener historial.
          </p>

          <div className="grid gap-2">
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: pago cargado por error, monto incorrecto..."
            />
          </div>

          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="w-full bg-red-500 text-white hover:bg-red-400"
          >
            {mutation.isPending ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
