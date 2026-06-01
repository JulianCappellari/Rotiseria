"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProducts } from "@/features/products/product.service";
import { getApiErrorData, getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters";
import { Order } from "@/types/order";
import { Product } from "@/types/product";

import { updateOrderItems } from "./order.service";

type EditableItem = {
  productId: string;
  variantId?: string;
  quantity: string;
  notes: string;
};

type StockErrorDetail = {
  productName: string;
  missingIngredient: string;
  required: number;
  available: number;
  unit: string;
};

function centsToInput(value?: number | null) {
  return value ? String(value / 100) : "";
}

function getProductPrice(product?: Product, variantId?: string) {
  if (!product) return 0;
  const variant = product.variants.find((item) => item.id === variantId);
  return variant?.priceInCents ?? product.basePriceInCents;
}

export function OrderEditDialog({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [discount, setDiscount] = useState(centsToInput(order.discountInCents));
  const [deliveryFee, setDeliveryFee] = useState(centsToInput(order.deliveryFeeInCents));
  const [notes, setNotes] = useState(order.notes || "");
  const [stockError, setStockError] = useState<StockErrorDetail[] | null>(null);

  const [items, setItems] = useState<EditableItem[]>(
    order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: String(item.quantity),
      notes: item.notes || "",
    })),
  );

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const canEdit = !["DELIVERED", "CANCELLED"].includes(order.status);

  const totals = useMemo(() => {
    const subtotalInCents = items.reduce((total, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const unitPriceInCents = getProductPrice(product, item.variantId);
      return total + unitPriceInCents * Number(item.quantity || 0);
    }, 0);

    const discountInCents = Math.round(Number(discount || 0) * 100);
    const deliveryFeeInCents = Math.round(Number(deliveryFee || 0) * 100);
    const totalInCents = subtotalInCents - discountInCents + deliveryFeeInCents;

    return {
      subtotalInCents,
      discountInCents,
      deliveryFeeInCents,
      totalInCents,
    };
  }, [deliveryFee, discount, items, products]);

  function resetFromOrder() {
    setDiscount(centsToInput(order.discountInCents));
    setDeliveryFee(centsToInput(order.deliveryFeeInCents));
    setNotes(order.notes || "");
    setStockError(null);
    setItems(
      order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: String(item.quantity),
        notes: item.notes || "",
      })),
    );
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateOrderItems(order.id, {
        discountInCents: totals.discountInCents,
        deliveryFeeInCents: totals.deliveryFeeInCents,
        notes: notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: Number(item.quantity),
          notes: item.notes || undefined,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast.success("Pedido actualizado correctamente");
      setOpen(false);
    },
    onError: (error) => {
      const response = getApiErrorData(error);

      if (Array.isArray(response?.details) && response.details.length > 0) {
        setStockError(response.details as StockErrorDetail[]);
        toast.error("No se pudo editar el pedido", {
          description: "Hay productos con insumos en faltante.",
        });
        return;
      }

      toast.error(getApiErrorMessage(error, "No se pudo editar el pedido"));
    },
  });

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (value) resetFromOrder();
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { productId: "", quantity: "1", notes: "" },
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) {
      toast.error("El pedido debe tener al menos un producto");
      return;
    }

    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateItem(index: number, patch: Partial<EditableItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function handleSave() {
    const hasInvalidItem = items.some(
      (item) => !item.productId || Number(item.quantity) <= 0,
    );

    if (hasInvalidItem) {
      toast.error("Revisá los productos y cantidades");
      return;
    }

    if (totals.totalInCents < 0) {
      toast.error("El total no puede quedar negativo");
      return;
    }

    setStockError(null);
    mutation.mutate();
  }

  if (!canEdit) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700">
        <Pencil className="h-4 w-4" />
        Editar pedido
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] !w-[calc(100vw-2rem)] !max-w-6xl overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-slate-950">
            Editar pedido #{order.orderNumber}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Modificá productos, cantidades, descuentos, delivery y notas.
          </p>
        </DialogHeader>

        <div className="grid max-h-[calc(92vh-76px)] overflow-hidden lg:grid-cols-[1fr_320px]">
          <div className="min-h-0 overflow-y-auto px-6 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Productos del pedido
                </h3>
                <p className="text-sm text-slate-500">
                  Cada línea recalcula el total automáticamente.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedProduct = products.find(
                  (product) => product.id === item.productId,
                );
                const selectedVariantId =
                  item.variantId && selectedProduct?.variants.some((variant) => variant.id === item.variantId)
                    ? item.variantId
                    : "BASE";
                const unitPriceInCents = getProductPrice(
                  selectedProduct,
                  item.variantId,
                );
                const lineTotalInCents =
                  unitPriceInCents * Number(item.quantity || 0);

                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_minmax(160px,220px)_96px_40px]">
                      <div className="grid gap-2">
                        <Label>Producto</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            value &&
                            updateItem(index, {
                              productId: value,
                              variantId: undefined,
                            })
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .filter((product) => product.isActive)
                              .map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Presentación</Label>
                        <Select
                          value={selectedVariantId}
                          disabled={!selectedProduct}
                          onValueChange={(value) =>
                            value &&
                            updateItem(index, {
                              variantId: value === "BASE" ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASE">
                              Base - {formatCurrency(selectedProduct?.basePriceInCents || 0)}
                            </SelectItem>
                            {selectedProduct?.variants.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id}>
                                {variant.name} - {formatCurrency(variant.priceInCents)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, { quantity: event.target.value })
                          }
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
                      <div className="grid gap-2">
                        <Label>Nota del producto</Label>
                        <Input
                          value={item.notes}
                          onChange={(event) =>
                            updateItem(index, { notes: event.target.value })
                          }
                          placeholder="Ej: sin sal, bien cocido..."
                        />
                      </div>

                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
                        <p className="text-xs font-medium text-slate-500">
                          Línea
                        </p>
                        <p className="font-semibold text-slate-950">
                          {formatCurrency(lineTotalInCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stockError && stockError.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  No se puede guardar por falta de stock
                </p>
                <div className="mt-3 grid gap-2">
                  {stockError.map((item, index) => (
                    <div
                      key={`${item.missingIngredient}-${index}`}
                      className="rounded-lg border border-red-200 bg-white p-3 text-sm"
                    >
                      <p className="font-medium text-slate-950">
                        {item.productName}
                      </p>
                      <p className="text-red-700">
                        Falta {item.missingIngredient}: requiere {item.required}{" "}
                        {item.unit}, disponible {item.available} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Descuento</Label>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Delivery</Label>
                <Input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(event) => setDeliveryFee(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Notas generales</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Notas internas o del cliente"
                  className="min-h-24"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <strong className="text-slate-950">
                      {formatCurrency(totals.subtotalInCents)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Descuento</span>
                    <strong className="text-slate-950">
                      -{formatCurrency(totals.discountInCents)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery</span>
                    <strong className="text-slate-950">
                      {formatCurrency(totals.deliveryFeeInCents)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                    <span className="font-semibold text-slate-950">Total</span>
                    <strong className="text-lg text-orange-700">
                      {formatCurrency(totals.totalInCents)}
                    </strong>
                  </div>
                </div>
              </div>

              <Button
                disabled={mutation.isPending}
                onClick={handleSave}
                className="h-10 w-full"
              >
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
