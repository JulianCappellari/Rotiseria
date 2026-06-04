"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateOrderStatus } from "./order.service";
import { Order } from "@/types/order";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  orderId: string;
  currentStatus: Order["status"];
};

const statuses: { value: Order["status"]; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PREPARATION", label: "En preparación" },
  { value: "READY", label: "Listo" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderActions({ orderId, currentStatus }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: Order["status"]) =>
      updateOrderStatus(orderId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order", orderId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["cash-sessions"] }),
      ]);

      toast.success("Estado actualizado");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo actualizar el estado"));
    },
  });

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) =>
        value && mutation.mutate(value as Order["status"])
      }
      disabled={mutation.isPending || currentStatus === "CANCELLED"}
    >
      <SelectTrigger className="w-[170px] border-slate-200 bg-white text-slate-900">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
