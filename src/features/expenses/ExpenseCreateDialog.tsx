"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createExpense,
  getExpenseCategories,
} from "@/features/expenses/expense.service";

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

export function ExpenseCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    categoryId: "NONE",
    paymentMethod: "CASH" as
      | "CASH"
      | "TRANSFER"
      | "DEBIT"
      | "CREDIT"
      | "QR"
      | "MERCADO_PAGO",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: getExpenseCategories,
  });

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Gasto registrado");
      setOpen(false);
      setForm({
        description: "",
        amount: "",
        categoryId: "NONE",
        paymentMethod: "CASH",
      });
    },
    onError: () => {
      toast.error("No se pudo registrar el gasto");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.description || !form.amount || Number(form.amount) <= 0) {
      toast.error("Completá descripción y monto válido");
      return;
    }

    mutation.mutate({
      description: form.description,
      amountInCents: Math.round(Number(form.amount) * 100),
      categoryId: form.categoryId === "NONE" ? undefined : form.categoryId,
      paymentMethod: form.paymentMethod,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-yellow-300">
        <Plus className="h-4 w-4" />
        Nuevo gasto
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar gasto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Ej: Compra de detergente"
            />
          </div>

          <div className="grid gap-2">
            <Label>Monto</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Ej: 3500"
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sin categoría</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Método de pago</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(value) =>
                value &&
                setForm({
                  ...form,
                  paymentMethod: value as typeof form.paymentMethod,
                })
              }
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
            {mutation.isPending ? "Guardando..." : "Registrar gasto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
