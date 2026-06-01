"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createSupplier } from "./supplier.service";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupplierCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Proveedor creado");
      setOpen(false);
      setForm({ name: "", phone: "", address: "", notes: "" });
    },
    onError: () => toast.error("No se pudo crear el proveedor"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    mutation.mutate({
      name: form.name,
      phone: form.phone || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-medium text-black hover:bg-yellow-300">
        <Plus className="h-4 w-4" />
        Nuevo proveedor
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Crear proveedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Distribuidora Centro"
            />
          </div>

          <div className="grid gap-2">
            <Label>Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="351..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Dirección</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Notas</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear proveedor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}