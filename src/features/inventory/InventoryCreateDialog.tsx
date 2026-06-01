"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createInventoryItem } from "./inventory.service";
import { getUnits } from "@/features/units/unit.service";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function InventoryCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    unitId: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    cost: "",
    isPerishable: "false",
    expirationDays: "",
    barcode: "",
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  const mutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Insumo creado");
      setOpen(false);
      setForm({
        name: "",
        category: "",
        unitId: "",
        currentStock: "",
        minStock: "",
        maxStock: "",
        cost: "",
        isPerishable: "false",
        expirationDays: "",
        barcode: "",
      });
    },
    onError: () => toast.error("No se pudo crear el insumo"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.category || !form.unitId) {
      toast.error("Completá nombre, categoría y unidad");
      return;
    }

    mutation.mutate({
      name: form.name,
      category: form.category,
      unitId: form.unitId,
      currentStock: Number(form.currentStock || 0),
      minStock: Number(form.minStock || 0),
      maxStock: form.maxStock ? Number(form.maxStock) : undefined,
      costPerUnitInCents: form.cost
        ? Math.round(Number(form.cost) * 100)
        : undefined,
      isPerishable: form.isPerishable === "true",
      expirationDays: form.expirationDays
        ? Number(form.expirationDays)
        : undefined,
      barcode: form.barcode || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-medium text-black hover:bg-yellow-300">
        <PackagePlus className="h-4 w-4" />
        Nuevo insumo
      </DialogTrigger>

      <DialogContent className="!max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Crear insumo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Papa"
              />
            </div>

            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Ej: VEGETABLE"
              />
            </div>

            <div className="grid gap-2">
              <Label>Unidad</Label>
              <Select
                value={form.unitId}
                onValueChange={(value) =>
                  value && setForm({ ...form, unitId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Costo unitario</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="Ej: 1200"
              />
            </div>

            <div className="grid gap-2">
              <Label>Stock actual</Label>
              <Input
                type="number"
                value={form.currentStock}
                onChange={(e) =>
                  setForm({ ...form, currentStock: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Stock mínimo</Label>
              <Input
                type="number"
                value={form.minStock}
                onChange={(e) =>
                  setForm({ ...form, minStock: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Stock máximo</Label>
              <Input
                type="number"
                value={form.maxStock}
                onChange={(e) =>
                  setForm({ ...form, maxStock: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Perecedero</Label>
              <Select
                value={form.isPerishable}
                onValueChange={(value) =>
                  value && setForm({ ...form, isPerishable: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear insumo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
