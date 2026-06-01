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

import { createProduct } from "./product.service";
import { getProductCategories } from "./productCategory.service";

export function ProductCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    saleType: "UNIT" as "UNIT" | "WEIGHT" | "PORTION",
    basePrice: "",
    cost: "",
    isRecipeBased: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: getProductCategories,
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto creado correctamente");
      setOpen(false);
      setForm({
        name: "",
        description: "",
        sku: "",
        categoryId: "",
        saleType: "UNIT",
        basePrice: "",
        cost: "",
        isRecipeBased: true,
      });
    },
    onError: () => {
      toast.error("Error al crear producto");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.categoryId || !form.basePrice) {
      toast.error("Completá nombre, categoría y precio");
      return;
    }

    mutation.mutate({
      name: form.name,
      description: form.description || undefined,
      sku: form.sku || undefined,
      categoryId: form.categoryId,
      saleType: form.saleType,
      basePriceInCents: Math.round(Number(form.basePrice) * 100),
      costInCents: form.cost ? Math.round(Number(form.cost) * 100) : undefined,
      isRecipeBased: form.isRecipeBased,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-yellow-300">
        <Plus className="h-4 w-4" />
        Nuevo producto
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] !max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Crear producto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Milanesa con papas"
            />
          </div>

          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Descripción breve del producto"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="MIL-PAPAS"
              />
            </div>

            <div className="grid gap-2">
              <Label>Categoría</Label>
              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  value && setForm({ ...form, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Tipo de venta</Label>
              <Select
                value={form.saleType}
                onValueChange={(value) =>
                  value &&
                  setForm({
                    ...form,
                    saleType: value as typeof form.saleType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIT">Unidad</SelectItem>
                  <SelectItem value="WEIGHT">Peso</SelectItem>
                  <SelectItem value="PORTION">Porción</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Precio venta</Label>
              <Input
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
                placeholder="5200"
              />
            </div>

            <div className="grid gap-2">
              <Label>Costo estimado</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="2300"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isRecipeBased}
              onChange={(e) =>
                setForm({ ...form, isRecipeBased: e.target.checked })
              }
            />
            Descontar stock mediante receta
          </label>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear producto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
