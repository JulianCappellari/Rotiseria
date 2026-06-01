"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createPurchase } from "./purchase.service";
import { getSuppliers } from "@/features/suppliers/supplier.service";
import { getInventoryItems } from "@/features/inventory/inventory.service";
import { formatCurrency } from "@/lib/formatters";
import { getApiErrorMessage } from "@/lib/api-error";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type PurchaseLine = {
  inventoryItemId: string;
  quantity: number;
  unitCost: number;
};

export function PurchaseCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("NONE");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [inventoryItemId, setInventoryItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [items, setItems] = useState<PurchaseLine[]>([]);

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventoryItems,
  });

  const mutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Compra registrada");
      setOpen(false);
      setSupplierId("NONE");
      setInvoiceNumber("");
      setNotes("");
      setItems([]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo registrar la compra"));
    },
  });

  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.unitCost * 100,
    0
  );

  function addItem() {
    if (!inventoryItemId || Number(quantity) <= 0 || Number(unitCost) <= 0) {
      toast.error("Seleccioná insumo, cantidad y costo");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        inventoryItemId,
        quantity: Number(quantity),
        unitCost: Number(unitCost),
      },
    ]);

    setInventoryItemId("");
    setQuantity("");
    setUnitCost("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Agregá al menos un insumo");
      return;
    }

    mutation.mutate({
      supplierId: supplierId === "NONE" ? undefined : supplierId,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitCostInCents: Math.round(item.unitCost * 100),
      })),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-medium text-black hover:bg-yellow-300">
        <Plus className="h-4 w-4" />
        Nueva compra
      </DialogTrigger>

      <DialogContent className="!max-w-4xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Proveedor</Label>
              <Select
                value={supplierId}
                onValueChange={(value) => value && setSupplierId(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sin proveedor</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>N° factura</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Total</Label>
              <div className="rounded-xl border border-yellow-700/40 px-3 py-2 font-bold text-yellow-300">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-700/40 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_120px_140px_auto]">
              <Select
                value={inventoryItemId}
                onValueChange={(value) => value && setInventoryItemId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar insumo" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} — stock: {item.currentStock} {item.unit.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input type="number" placeholder="Cant." value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <Input type="number" placeholder="Costo" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />

              <Button type="button" onClick={addItem}>
                Agregar
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-yellow-100/60">No agregaste insumos.</p>
              ) : (
                items.map((item, index) => {
                  const inventoryItem = inventory.find((i) => i.id === item.inventoryItemId);

                  return (
                    <div key={index} className="flex items-center justify-between rounded-xl bg-yellow-500/10 p-3">
                      <div>
                        <p className="font-medium text-yellow-50">{inventoryItem?.name}</p>
                        <p className="text-sm text-yellow-100/60">
                          {item.quantity} x {formatCurrency(item.unitCost * 100)}
                        </p>
                      </div>

                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Registrar compra"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
