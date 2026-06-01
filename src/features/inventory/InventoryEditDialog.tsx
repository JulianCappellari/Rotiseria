"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { InventoryItem } from "@/types/inventory";
import { updateInventoryItem } from "./inventory.service";

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

export function InventoryEditDialog({ item }: { item: InventoryItem }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    minStock: String(item.minStock),
    maxStock: item.maxStock ? String(item.maxStock) : "",
    cost: item.costPerUnitInCents ? String(item.costPerUnitInCents / 100) : "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      updateInventoryItem(item.id, {
        name: form.name,
        category: form.category,
        minStock: Number(form.minStock || 0),
        maxStock: form.maxStock ? Number(form.maxStock) : undefined,
        costPerUnitInCents: form.cost
          ? Math.round(Number(form.cost) * 100)
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item", item.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast.success("Insumo actualizado");
      setOpen(false);
    },
    onError: () => toast.error("No se pudo actualizar el insumo"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-yellow-300">
        <Pencil className="h-4 w-4" />
        Editar insumo
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar insumo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Stock mínimo</Label>
            <Input
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Stock máximo</Label>
            <Input
              type="number"
              value={form.maxStock}
              onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Costo unitario</Label>
            <Input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </div>

          <Button className="w-full" onClick={() => mutation.mutate()}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
