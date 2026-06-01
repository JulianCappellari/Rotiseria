"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createStockMovement, getInventoryItems } from "./inventory.service";
import { getApiErrorMessage } from "@/lib/api-error";

const movementTypes = [
  { value: "PURCHASE", label: "Compra / entrada" },
  { value: "ADJUSTMENT_IN", label: "Ajuste positivo" },
  { value: "ADJUSTMENT_OUT", label: "Ajuste negativo" },
  { value: "WASTE", label: "Desperdicio / pérdida" },
  { value: "RETURN", label: "Devolución" },
] as const;

export function StockMovementDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    inventoryItemId: "",
    type: "PURCHASE" as (typeof movementTypes)[number]["value"],
    quantity: "",
    unitCost: "",
    reason: "",
  });

  const { data: items = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventoryItems,
  });

  const mutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Movimiento registrado");
      setOpen(false);
      setForm({
        inventoryItemId: "",
        type: "PURCHASE",
        quantity: "",
        unitCost: "",
        reason: "",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Error al mover stock"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.inventoryItemId || !form.quantity) {
      toast.error("Seleccioná insumo y cantidad");
      return;
    }

    mutation.mutate({
      inventoryItemId: form.inventoryItemId,
      type: form.type,
      quantity: Number(form.quantity),
      unitCostInCents: form.unitCost
        ? Math.round(Number(form.unitCost) * 100)
        : undefined,
      reason: form.reason || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-yellow-300">
        <Plus className="h-4 w-4" />
        Movimiento de stock
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Insumo</Label>
            <Select
              value={form.inventoryItemId}
              onValueChange={(value) =>
                value && setForm({ ...form, inventoryItemId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar insumo" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} — {item.currentStock} {item.unit.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  value &&
                  setForm({ ...form, type: value as typeof form.type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Ej: 5"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Costo unitario</Label>
            <Input
              type="number"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              placeholder="Opcional. Ej: 1500"
            />
          </div>

          <div className="grid gap-2">
            <Label>Motivo</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ej: Compra semanal, mercadería vencida, ajuste manual..."
            />
          </div>

          <Button disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Registrar movimiento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
