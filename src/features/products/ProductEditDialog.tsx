"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Product } from "@/types/product";
import { updateProduct } from "./product.service";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  product: Product;
};

export function ProductEditDialog({ product }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: product.name,
    sku: product.sku || "",
    basePrice: String(product.basePriceInCents / 100),
    cost: product.costInCents ? String(product.costInCents / 100) : "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      updateProduct(product.id, {
        name: form.name,
        sku: form.sku || undefined,
        basePriceInCents: Math.round(Number(form.basePrice) * 100),
        costInCents: form.cost
          ? Math.round(Number(form.cost) * 100)
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto actualizado");
      setOpen(false);
    },
    onError: () => toast.error("No se pudo actualizar el producto"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
        <Pencil className="h-4 w-4" />
        Editar producto
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
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
            <Label>SKU</Label>
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Precio</Label>
            <Input
              type="number"
              value={form.basePrice}
              onChange={(e) =>
                setForm({ ...form, basePrice: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Costo</Label>
            <Input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}