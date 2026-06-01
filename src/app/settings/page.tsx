"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  Pencil,
  Plus,
  ReceiptText,
  Ruler,
  Save,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { getApiErrorMessage } from "@/lib/api-error";
import { productCategoryTypeLabel } from "@/lib/business-labels";
import {
  createExpenseCategory,
  createProductCategory,
  createUnit,
  getBusinessSettings,
  getExpenseCategoriesForSettings,
  getProductCategoriesForSettings,
  getUnitsForSettings,
  ProductCategoryType,
  removeExpenseCategory,
  removeProductCategory,
  removeUnit,
  updateBusinessSettings,
  updateExpenseCategory,
  updateProductCategory,
  updateUnit,
} from "@/features/settings/settings.service";
import { ExpenseCategory } from "@/types/expense";
import { ProductCategory } from "@/types/product-category";
import { Unit } from "@/types/unit";

const PRODUCT_CATEGORY_TYPES: ProductCategoryType[] = [
  "FOOD",
  "DRINK",
  "COMBO",
  "OTHER",
];

function cleanOptional(value: string) {
  return value.trim() || null;
}

function StatusPill({ active = true }: { active?: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }
    >
      {active ? "Activa" : "Inactiva"}
    </Badge>
  );
}

function EmptyList({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function BusinessSettingsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: getBusinessSettings,
  });
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    address: string;
    taxId: string;
    receiptFooter: string;
  } | null>(null);
  const visibleForm = form ?? {
    name: data?.name || "",
    phone: data?.phone || "",
    address: data?.address || "",
    taxId: data?.taxId || "",
    receiptFooter: data?.receiptFooter || "",
  };

  function updateForm(
    field: keyof typeof visibleForm,
    value: string
  ) {
    setForm((current) => ({
      ...(current ?? visibleForm),
      [field]: value,
    }));
  }

  function businessFormFromData(settings: typeof data) {
    return {
      name: settings?.name || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      taxId: settings?.taxId || "",
      receiptFooter: settings?.receiptFooter || "",
    };
  }

  const mutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: (settings) => {
      setForm(businessFormFromData(settings));
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      toast.success("Datos del negocio actualizados");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No se pudieron guardar los datos")
      ),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!visibleForm.name.trim()) {
      toast.error("El nombre del negocio es obligatorio");
      return;
    }

    mutation.mutate({
      name: visibleForm.name.trim(),
      phone: cleanOptional(visibleForm.phone),
      address: cleanOptional(visibleForm.address),
      taxId: cleanOptional(visibleForm.taxId),
      receiptFooter: cleanOptional(visibleForm.receiptFooter),
    });
  }

  return (
    <SectionCard
      title="Datos del negocio"
      icon={<Building2 className="h-5 w-5 text-orange-600" />}
    >
      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando datos...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="business-name">Nombre comercial</Label>
              <Input
                id="business-name"
                value={visibleForm.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Ej: Roticeria Centro"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="business-phone">Telefono</Label>
              <Input
                id="business-phone"
                value={visibleForm.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                placeholder="Ej: 11 5555-5555"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="business-tax">CUIT / ID fiscal</Label>
              <Input
                id="business-tax"
                value={visibleForm.taxId}
                onChange={(event) => updateForm("taxId", event.target.value)}
                placeholder="Ej: 20-00000000-0"
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="business-address">Direccion</Label>
              <Input
                id="business-address"
                value={visibleForm.address}
                onChange={(event) => updateForm("address", event.target.value)}
                placeholder="Calle, numero, localidad"
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="business-footer">Pie de comprobante</Label>
              <Textarea
                id="business-footer"
                value={visibleForm.receiptFooter}
                onChange={(event) =>
                  updateForm("receiptFooter", event.target.value)
                }
                placeholder="Mensaje para tickets o comprobantes"
              />
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Guardando..." : "Guardar datos"}
          </Button>
        </form>
      )}
    </SectionCard>
  );
}

function ProductCategoriesPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductCategoryType>("FOOD");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    type: "FOOD" as ProductCategoryType,
    isActive: true,
  });
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["product-categories"],
    queryFn: getProductCategoriesForSettings,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createMutation = useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      invalidate();
      setName("");
      setType("FOOD");
      toast.success("Categoria creada");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No se pudo crear la categoria")),
  });

  const updateMutation = useMutation({
    mutationFn: updateProductCategory,
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Categoria actualizada");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No se pudo actualizar la categoria")
      ),
  });

  const removeMutation = useMutation({
    mutationFn: removeProductCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Categoria desactivada");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No se pudo desactivar la categoria")
      ),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Ingresa un nombre");
    createMutation.mutate({ name: name.trim(), type, isActive: true });
  }

  function startEdit(category: ProductCategory) {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      type: category.type as ProductCategoryType,
      isActive: category.isActive,
    });
  }

  function saveEdit(id: string) {
    if (!draft.name.trim()) return toast.error("Ingresa un nombre");
    updateMutation.mutate({
      id,
      data: {
        name: draft.name.trim(),
        type: draft.type,
        isActive: draft.isActive,
      },
    });
  }

  return (
    <SectionCard
      title="Categorias de productos"
      icon={<Tags className="h-5 w-5 text-orange-600" />}
    >
      <form onSubmit={handleCreate} className="mb-4 grid gap-2 md:grid-cols-[1fr_180px_auto]">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nueva categoria"
        />
        <Select
          value={type}
          onValueChange={(value) => value && setType(value as ProductCategoryType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORY_TYPES.map((item) => (
              <SelectItem key={item} value={item}>
                {productCategoryTypeLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando categorias...</p>
      ) : categories.length === 0 ? (
        <EmptyList message="Todavia no hay categorias de productos." />
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_150px_90px_auto]"
              >
                {isEditing ? (
                  <>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                    <Select
                      value={draft.type}
                      onValueChange={(value) =>
                        value &&
                        setDraft((current) => ({
                          ...current,
                          type: value as ProductCategoryType,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORY_TYPES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {productCategoryTypeLabel(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          isActive: !current.isActive,
                        }))
                      }
                    >
                      {draft.isActive ? "Activa" : "Inactiva"}
                    </Button>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => saveEdit(category.id)}
                        disabled={updateMutation.isPending}
                        aria-label="Guardar categoria"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancelar edicion"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-slate-950">
                        {category.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {productCategoryTypeLabel(category.type)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <StatusPill active={category.isActive} />
                    </div>
                    <div />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => startEdit(category)}
                        aria-label="Editar categoria"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => removeMutation.mutate(category.id)}
                        disabled={!category.isActive || removeMutation.isPending}
                        aria-label="Desactivar categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function ExpenseCategoriesPanel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", isActive: true });
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: getExpenseCategoriesForSettings,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  const createMutation = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      invalidate();
      setName("");
      toast.success("Categoria creada");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No se pudo crear la categoria")),
  });

  const updateMutation = useMutation({
    mutationFn: updateExpenseCategory,
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Categoria actualizada");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No se pudo actualizar la categoria")
      ),
  });

  const removeMutation = useMutation({
    mutationFn: removeExpenseCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Categoria desactivada");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "No se pudo desactivar la categoria")
      ),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return toast.error("Ingresa un nombre");
    createMutation.mutate({ name: name.trim(), isActive: true });
  }

  function startEdit(category: ExpenseCategory) {
    setEditingId(category.id);
    setDraft({ name: category.name, isActive: category.isActive });
  }

  function saveEdit(id: string) {
    if (!draft.name.trim()) return toast.error("Ingresa un nombre");
    updateMutation.mutate({
      id,
      data: { name: draft.name.trim(), isActive: draft.isActive },
    });
  }

  return (
    <SectionCard
      title="Categorias de gastos"
      icon={<ReceiptText className="h-5 w-5 text-orange-600" />}
    >
      <form onSubmit={handleCreate} className="mb-4 grid gap-2 md:grid-cols-[1fr_auto]">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nueva categoria"
        />
        <Button type="submit" disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando categorias...</p>
      ) : categories.length === 0 ? (
        <EmptyList message="Todavia no hay categorias de gastos." />
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_90px_auto]"
              >
                {isEditing ? (
                  <>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          isActive: !current.isActive,
                        }))
                      }
                    >
                      {draft.isActive ? "Activa" : "Inactiva"}
                    </Button>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => saveEdit(category.id)}
                        disabled={updateMutation.isPending}
                        aria-label="Guardar categoria"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancelar edicion"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-950">
                      {category.name}
                    </p>
                    <div className="flex items-center">
                      <StatusPill active={category.isActive} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => startEdit(category)}
                        aria-label="Editar categoria"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => removeMutation.mutate(category.id)}
                        disabled={!category.isActive || removeMutation.isPending}
                        aria-label="Desactivar categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function UnitsPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", symbol: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", symbol: "" });
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: getUnitsForSettings,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["units"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };

  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      invalidate();
      setForm({ name: "", symbol: "" });
      toast.success("Unidad creada");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No se pudo crear la unidad")),
  });

  const updateMutation = useMutation({
    mutationFn: updateUnit,
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Unidad actualizada");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "No se pudo actualizar la unidad")),
  });

  const removeMutation = useMutation({
    mutationFn: removeUnit,
    onSuccess: () => {
      invalidate();
      toast.success("Unidad eliminada");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "No se pudo eliminar. Puede estar usada por un insumo."
        )
      ),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.symbol.trim()) {
      toast.error("Completa nombre y simbolo");
      return;
    }

    createMutation.mutate({
      name: form.name.trim(),
      symbol: form.symbol.trim(),
    });
  }

  function startEdit(unit: Unit) {
    setEditingId(unit.id);
    setDraft({ name: unit.name, symbol: unit.symbol });
  }

  function saveEdit(id: string) {
    if (!draft.name.trim() || !draft.symbol.trim()) {
      toast.error("Completa nombre y simbolo");
      return;
    }

    updateMutation.mutate({
      id,
      data: { name: draft.name.trim(), symbol: draft.symbol.trim() },
    });
  }

  return (
    <SectionCard
      title="Unidades"
      icon={<Ruler className="h-5 w-5 text-orange-600" />}
    >
      <form onSubmit={handleCreate} className="mb-4 grid gap-2 md:grid-cols-[1fr_120px_auto]">
        <Input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Ej: Kilogramo"
        />
        <Input
          value={form.symbol}
          onChange={(event) =>
            setForm((current) => ({ ...current, symbol: event.target.value }))
          }
          placeholder="kg"
        />
        <Button type="submit" disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando unidades...</p>
      ) : units.length === 0 ? (
        <EmptyList message="Todavia no hay unidades cargadas." />
      ) : (
        <div className="space-y-2">
          {units.map((unit) => {
            const isEditing = editingId === unit.id;

            return (
              <div
                key={unit.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_110px_auto]"
              >
                {isEditing ? (
                  <>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                    <Input
                      value={draft.symbol}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          symbol: event.target.value,
                        }))
                      }
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => saveEdit(unit.id)}
                        disabled={updateMutation.isPending}
                        aria-label="Guardar unidad"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancelar edicion"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-950">{unit.name}</p>
                    <Badge variant="outline" className="w-fit bg-slate-50">
                      {unit.symbol}
                    </Badge>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => startEdit(unit)}
                        aria-label="Editar unidad"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => removeMutation.mutate(unit.id)}
                        disabled={removeMutation.isPending}
                        aria-label="Eliminar unidad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracion"
        description="Administra los datos base que usa la operacion diaria."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <BusinessSettingsPanel />
        <div className="space-y-6">
          <ProductCategoriesPanel />
          <ExpenseCategoriesPanel />
          <UnitsPanel />
        </div>
      </div>
    </div>
  );
}
