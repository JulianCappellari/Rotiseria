"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getProducts } from "@/features/products/product.service";

import { createOrder } from "./order.service";
import { getApiErrorData } from "@/lib/api-error";
import { formatCurrency } from "@/lib/formatters";

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
import { getCustomers } from "../customer/customer.service";

type OrderLine = {
  productId: string;
  quantity: number;
};

type OrderSource = "COUNTER" | "WHATSAPP" | "PHONE" | "DELIVERY_APP";
type FulfillmentType = "TAKEAWAY" | "DINE_IN" | "DELIVERY";
type PaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "DEBIT"
  | "CREDIT"
  | "QR"
  | "MERCADO_PAGO";
type StockErrorDetail = {
  productName: string;
  missingIngredient: string;
  required: number;
  available: number;
  unit: string;
};

export function OrderCreateDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [customerId, setCustomerId] = useState("NONE");
  const [source, setSource] = useState<OrderSource>("COUNTER");
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("TAKEAWAY");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | "NONE">("NONE");

  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [productSearch, setProductSearch] = useState("");
  const [items, setItems] = useState<OrderLine[]>([]);
  const [stockError, setStockError] = useState<StockErrorDetail[] | null>(null);

  const [customerMode, setCustomerMode] = useState<
    "NONE" | "EXISTING" | "QUICK"
  >("NONE");
  const [quickCustomerName, setQuickCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customerId, customers],
  );

  useEffect(() => {
    if (customerMode !== "EXISTING" || !selectedCustomer) return;

    setCustomerPhone((current) => current || selectedCustomer.phone || "");

    if (fulfillmentType === "DELIVERY") {
      setDeliveryAddress((current) => current || selectedCustomer.address || "");
    }
  }, [customerMode, fulfillmentType, selectedCustomer]);

  const filteredProducts = products
    .filter((product) => product.isActive)
    .filter((product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()),
    )
    .slice(0, 8);
  const total = useMemo(() => {
    const subtotal = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + (product?.basePriceInCents || 0) * item.quantity;
    }, 0);

    return (
      subtotal -
      Math.round(Number(discount || 0) * 100) +
      Math.round(Number(deliveryFee || 0) * 100)
    );
  }, [items, products, discount, deliveryFee]);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      toast.success("Pedido creado correctamente");
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const response = getApiErrorData(error);

      if (Array.isArray(response?.details) && response.details.length > 0) {
        setStockError(response.details as StockErrorDetail[]);

        toast.error("No se puede crear el pedido", {
          description: "Hay productos con insumos en faltante.",
        });

        return;
      }

      toast.error(response?.message || "Error al crear pedido");
    },
  });

  function resetForm() {
    setCustomerId("NONE");
    setSource("COUNTER");
    setFulfillmentType("TAKEAWAY");
    setPaymentMethod("NONE");
    setPaidAmount("");
    setDiscount("");
    setDeliveryFee("");
    setNotes("");
    setSelectedProductId("");
    setQuantity("1");
    setItems([]);
    setStockError(null);
    setCustomerMode("NONE");
    setQuickCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setCustomerId("NONE");
  }

  function addItem() {
    if (!selectedProductId || Number(quantity) <= 0) {
      toast.error("Seleccioná producto y cantidad válida");
      return;
    }

    setItems((prev) => {
      const exists = prev.find((item) => item.productId === selectedProductId);

      if (exists) {
        return prev.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item,
        );
      }

      return [
        ...prev,
        { productId: selectedProductId, quantity: Number(quantity) },
      ];
    });

    setSelectedProductId("");
    setProductSearch("");
    setQuantity("1");
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Agregá al menos un producto");
      return;
    }

    const paid = Math.round(Number(paidAmount || 0) * 100);

    if (paid > 0 && paymentMethod === "NONE") {
      toast.error("Seleccioná método de pago");
      return;
    }

    setStockError(null);
    if (customerMode === "QUICK" && !quickCustomerName.trim()) {
      toast.error("Ingresá el nombre del cliente");
      return;
    }

    if (customerMode === "EXISTING" && customerId === "NONE") {
      toast.error("Selecciona un cliente");
      return;
    }

    if (fulfillmentType === "DELIVERY") {
      if (customerMode === "NONE") {
        toast.error("Para delivery selecciona un cliente rapido o existente");
        return;
      }

      if (!deliveryAddress.trim()) {
        toast.error("Ingresa la direccion de entrega");
        return;
      }
    }

    mutation.mutate({
      customerId: customerMode === "EXISTING" ? customerId : undefined,
      customerName:
        customerMode === "QUICK" ? quickCustomerName.trim() : undefined,
      customerPhone:
        customerMode !== "NONE" && customerPhone.trim()
          ? customerPhone.trim()
          : undefined,
      customerAddress:
        fulfillmentType === "DELIVERY" ? deliveryAddress.trim() : undefined,
      source,
      fulfillmentType,
      notes: notes || undefined,
      discountInCents: Math.round(Number(discount || 0) * 100),
      deliveryFeeInCents: Math.round(Number(deliveryFee || 0) * 100),
      paidAmountInCents: paid,
      paymentMethod: paymentMethod === "NONE" ? undefined : paymentMethod,
      items,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        Nuevo pedido
      </DialogTrigger>

      <DialogContent className="!w-[calc(100vw-2rem)] !max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl p-0">
        <div className="space-y-6 p-6">
          <DialogHeader>
            <DialogTitle>Crear pedido</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="grid gap-2">
                <Label>Tipo de cliente</Label>
                <Select
                  value={customerMode}
                  onValueChange={(value) => {
                    if (!value) return;

                    const nextMode = value as typeof customerMode;
                    const hasChangedMode = nextMode !== customerMode;

                    setCustomerMode(nextMode);

                    if (hasChangedMode) {
                      setCustomerPhone("");
                      setDeliveryAddress("");
                    }

                    if (nextMode !== "EXISTING") {
                      setCustomerId("NONE");
                    }

                    if (nextMode !== "QUICK") {
                      setQuickCustomerName("");
                    }

                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Mostrador</SelectItem>
                    <SelectItem value="EXISTING">Cliente existente</SelectItem>
                    <SelectItem value="QUICK">Cliente rapido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid min-w-0 gap-2">
                <Label>Origen</Label>
                <Select
                  value={source}
                  onValueChange={(value) =>
                    value && setSource(value as OrderSource)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COUNTER">Mostrador</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="PHONE">Teléfono</SelectItem>
                    <SelectItem value="DELIVERY_APP">App delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid min-w-0 gap-2">
                <Label>Entrega</Label>
                <Select
                  value={fulfillmentType}
                  onValueChange={(value) => {
                    if (!value) return;

                    const nextFulfillmentType = value as FulfillmentType;
                    setFulfillmentType(nextFulfillmentType);

                    if (
                      nextFulfillmentType === "DELIVERY" &&
                      customerMode === "EXISTING" &&
                      selectedCustomer?.address
                    ) {
                      setDeliveryAddress(selectedCustomer.address);
                    }

                    if (nextFulfillmentType !== "DELIVERY") {
                      setDeliveryAddress("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TAKEAWAY">Retira</SelectItem>
                    <SelectItem value="DINE_IN">En local</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {customerMode === "EXISTING" && (
              <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select
                    value={customerId}
                    onValueChange={(value) => {
                      if (!value) return;

                      const customer = customers.find(
                        (item) => item.id === value,
                      );

                      setCustomerId(value);
                      setCustomerPhone(customer?.phone || "");

                      if (fulfillmentType === "DELIVERY") {
                        setDeliveryAddress(customer?.address || "");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Telefono</Label>
                  <Input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            )}

            {customerMode === "QUICK" && (
              <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Nombre del cliente</Label>
                  <Input
                    value={quickCustomerName}
                    onChange={(event) =>
                      setQuickCustomerName(event.target.value)
                    }
                    placeholder="Ej: Juan Perez"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Telefono</Label>
                  <Input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            )}

            {fulfillmentType === "DELIVERY" && (
              <div className="grid gap-3 rounded-xl border bg-muted/30 p-4">
                <div className="grid gap-2">
                  <Label>Direccion de entrega *</Label>
                  <Input
                    value={deliveryAddress}
                    disabled={customerMode === "NONE"}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Calle, numero, piso, barrio"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {customerMode === "NONE"
                    ? "Para delivery, elegi un cliente rapido o existente."
                    : "Se va a guardar como direccion del cliente para futuros pedidos."}
                </p>
              </div>
            )}

            <div className="space-y-4 rounded-xl border p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_120px_auto]">
                <div className="relative">
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProductId("");
                    }}
                    placeholder="Escribí el producto..."
                    className="w-full"
                  />

                  {productSearch && !selectedProductId && (
                    <div className="absolute z-[9999] mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-yellow-700/60 bg-black shadow-2xl">
                      {filteredProducts.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-yellow-100/60">
                          No se encontraron productos.
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setProductSearch(product.name);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-yellow-50 hover:bg-yellow-500/10"
                          >
                            <span>{product.name}</span>
                            <span className="text-yellow-300">
                              {formatCurrency(product.basePriceInCents)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <Button type="button" onClick={addItem}>
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todavía no agregaste productos.
                  </p>
                ) : (
                  items.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );

                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {product?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x{" "}
                            {formatCurrency(product?.basePriceInCents || 0)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="grid min-w-0 gap-2">
                <Label>Descuento</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <div className="grid min-w-0 gap-2">
                <Label>Delivery</Label>
                <Input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                />
              </div>

              <div className="grid min-w-0 gap-2">
                <Label>Pagado</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>

              <div className="grid min-w-0 gap-2">
                <Label>Método</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => value && setPaymentMethod(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Sin pago</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="DEBIT">Débito</SelectItem>
                    <SelectItem value="CREDIT">Crédito</SelectItem>
                    <SelectItem value="QR">QR</SelectItem>
                    <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notas / indicaciones</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: tocar timbre, pagar con cambio, entregar en porteria"
              />
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                Total estimado
              </span>
              <span className="text-2xl font-bold">
                {formatCurrency(total)}
              </span>
            </div>

            {stockError && stockError.length > 0 && (
              <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-4">
                <p className="font-semibold text-red-300">
                  No se puede crear el pedido por falta de stock
                </p>

                <div className="mt-3 space-y-2">
                  {stockError.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-red-800/40 bg-black/40 p-3 text-sm"
                    >
                      <p className="text-yellow-50">
                        Producto:{" "}
                        <span className="font-semibold text-yellow-300">
                          {item.productName}
                        </span>
                      </p>

                      <p className="text-red-300">
                        Falta insumo: {item.missingIngredient}
                      </p>

                      <p className="text-yellow-100/70">
                        Necesario: {item.required} {item.unit} · Disponible:{" "}
                        {item.available} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Creando..." : "Crear pedido"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
