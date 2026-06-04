"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  CircleDollarSign,
  type LucideIcon,
  Package,
  Plus,
  Ruler,
  Save,
  Trash2,
} from "lucide-react"

import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

type CatalogItem = {
  id: string
  name: string
  symbol?: string | null
  type?: string | null
  abbreviation?: string | null
  description?: string | null
  isActive?: boolean
}

type CatalogField = {
  key: "name" | "abbreviation" | "description" | "type"
  apiKey?: "name" | "symbol" | "type"
  label: string
  placeholder: string
}

type CatalogConfig = {
  id: string
  title: string
  description: string
  endpoint: string
  icon: LucideIcon
  fields: CatalogField[]
}

type BusinessSettings = {
  name?: string
  taxId?: string
  address?: string
  phone?: string
  receiptFooter?: string
}

const CATALOGS: CatalogConfig[] = [
  {
    id: "product-categories",
    title: "Categorias de productos",
    description: "Organiza pizzas, empanadas, bebidas y otros productos de venta.",
    endpoint: "/product-categories",
    icon: Package,
    fields: [
      { key: "name", label: "Nombre", placeholder: "Ej: Pizzas" },
    ],
  },
  {
    id: "expense-categories",
    title: "Categorias de gastos",
    description: "Separa alquiler, servicios, compras generales y gastos varios.",
    endpoint: "/expense-categories",
    icon: CircleDollarSign,
    fields: [
      { key: "name", label: "Nombre", placeholder: "Ej: Servicios" },
    ],
  },
  {
    id: "units",
    title: "Unidades",
    description: "Define kg, unidad, litro, caja y cualquier unidad operativa.",
    endpoint: "/units",
    icon: Ruler,
    fields: [
      { key: "name", label: "Nombre", placeholder: "Ej: Kilogramo" },
      {
        key: "abbreviation",
        apiKey: "symbol",
        label: "Abreviatura",
        placeholder: "Ej: kg",
      },
    ],
  },
]

function unwrapApiData<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }

  return value as T
}

function getList(value: unknown): CatalogItem[] {
  const unwrapped = unwrapApiData<unknown>(value)

  if (Array.isArray(unwrapped)) {
    return unwrapped as CatalogItem[]
  }

  if (!unwrapped || typeof unwrapped !== "object") {
    return []
  }

  for (const key of ["items", "data", "categories", "units"]) {
    const possibleList = (unwrapped as Record<string, unknown>)[key]

    if (Array.isArray(possibleList)) {
      return possibleList as CatalogItem[]
    }
  }

  return []
}

async function safeDelete(endpoint: string, id: string) {
  return api.delete(`${endpoint}/${id}`)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const response = (error as { response?: { data?: unknown }; message?: string })
      .response

    if (response?.data && typeof response.data === "object") {
      const data = response.data as {
        message?: string
        errors?: Record<string, string[]>
      }

      const firstFieldError = data.errors
        ? Object.values(data.errors).flat().find(Boolean)
        : undefined

      return firstFieldError ?? data.message ?? fallback
    }

    return (error as { message?: string }).message ?? fallback
  }

  return fallback
}

function getItemValue(item: CatalogItem, field: CatalogField) {
  const apiKey = field.apiKey ?? field.key
  const value = item[field.key] ?? item[apiKey as keyof CatalogItem]
  return value == null ? "" : String(value)
}

function buildCatalogPayload(
  fields: CatalogField[],
  values: Record<string, string>,
) {
  return fields.reduce<Record<string, string>>((payload, field) => {
    const value = values[field.key]?.trim()

    if (!value) {
      return payload
    }

    payload[field.apiKey ?? field.key] = value
    return payload
  }, {})
}

function CatalogSection({ config }: { config: CatalogConfig }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Record<string, Record<string, string>>>({})
  const [errorMessage, setErrorMessage] = useState("")
  const Icon = config.icon
  const createGridClass =
    config.fields.length > 1
      ? "sm:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      : "sm:grid-cols-[minmax(0,1fr)_auto]"
  const createButtonClass =
    config.fields.length > 1 ? "sm:col-span-2 2xl:col-span-1" : ""
  const itemGridClass =
    config.fields.length > 1
      ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      : "sm:grid-cols-[minmax(0,1fr)_auto]"

  const query = useQuery({
    queryKey: ["settings", config.id],
    queryFn: async () => getList(await api.get(config.endpoint)),
  })

  const items = useMemo(
    () => (query.data ?? []).filter((item) => item.isActive !== false),
    [query.data],
  )

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!draft.name?.trim()) {
        throw new Error("El nombre es obligatorio")
      }

      return api.post(config.endpoint, buildCatalogPayload(config.fields, draft))
    },
    onSuccess: () => {
      setDraft({})
      setErrorMessage("")
      queryClient.invalidateQueries({ queryKey: ["settings", config.id] })
      queryClient.invalidateQueries({ queryKey: [config.id] })
    },
    onError: (error) =>
      setErrorMessage(getErrorMessage(error, "No se pudo crear")),
  })

  const updateMutation = useMutation({
    mutationFn: async (item: CatalogItem) => {
      const values = editing[item.id] ?? {}
      return api.patch(
        `${config.endpoint}/${item.id}`,
        buildCatalogPayload(config.fields, values),
      )
    },
    onSuccess: () => {
      setErrorMessage("")
      queryClient.invalidateQueries({ queryKey: ["settings", config.id] })
      queryClient.invalidateQueries({ queryKey: [config.id] })
      queryClient.invalidateQueries({ queryKey: [config.id] })
    },
    onError: (error) =>
      setErrorMessage(getErrorMessage(error, "No se pudo guardar el cambio")),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => safeDelete(config.endpoint, id),
    onSuccess: () => {
      setErrorMessage("")
      queryClient.invalidateQueries({ queryKey: ["settings", config.id] })
    },
    onError: (error) =>
      setErrorMessage(getErrorMessage(error, "No se pudo eliminar")),
  })

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">{config.title}</h2>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>
      </div>

      <div className={`mt-5 grid gap-3 rounded-lg bg-slate-50 p-3 ${createGridClass}`}>
        {config.fields.map((field) => (
          <label key={field.key} className="grid min-w-0 gap-1 text-sm font-medium text-slate-700">
            {field.label}
            <input
              value={draft[field.key] ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              placeholder={field.placeholder}
              className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
            />
          </label>
        ))}
        <Button
          type="button"
          className={`h-10 self-end ${createButtonClass}`}
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Agregar
        </Button>
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        {query.isLoading ? (
          <div className="p-4 text-sm text-slate-500">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            Todavia no hay registros cargados.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <div
                key={item.id}
                className={`grid min-w-0 gap-2 p-3 ${itemGridClass}`}
              >
                {config.fields.map((field) => (
                  <input
                    key={field.key}
                    value={editing[item.id]?.[field.key] ?? getItemValue(item, field)}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        [item.id]: {
                          ...(current[item.id] ?? {}),
                          [field.key]: event.target.value,
                        },
                      }))
                    }
                    className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                  />
                ))}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="icon"
                    title="Guardar"
                    aria-label="Guardar"
                    onClick={() => updateMutation.mutate(item)}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    title="Eliminar"
                    aria-label="Eliminar"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function BusinessSettingsSection() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BusinessSettings>({})
  const [errorMessage, setErrorMessage] = useState("")

  const query = useQuery({
    queryKey: ["settings", "business"],
    queryFn: async () => unwrapApiData<BusinessSettings>(await api.get("/business-settings")),
  })

  useEffect(() => {
    if (query.data) {
      setForm(query.data)
    }
  }, [query.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      try {
        return await api.patch("/business-settings", form)
      } catch {
        return api.put("/business-settings", form)
      }
    },
    onSuccess: () => {
      setErrorMessage("")
      queryClient.invalidateQueries({ queryKey: ["settings", "business"] })
    },
    onError: () => setErrorMessage("No se pudieron guardar los datos del negocio"),
  })

  const fields: Array<{
    key: keyof BusinessSettings
    label: string
    placeholder: string
  }> = [
      { key: "name", label: "Nombre comercial", placeholder: "Ej: Rotiseria Don Jose" },
      { key: "taxId", label: "CUIT", placeholder: "20-00000000-0" },
      { key: "address", label: "Direccion", placeholder: "Calle y numero" },
      { key: "phone", label: "Telefono", placeholder: "Numero de contacto" },
      { key: "receiptFooter", label: "Pie de ticket", placeholder: "Gracias por su compra" },
    ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Datos del negocio</h2>
          <p className="text-sm text-slate-500">
            Informacion usada en comprobantes, reportes y encabezados internos.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="grid gap-1 text-sm font-medium text-slate-700">
            {field.label}
            <input
              value={form[field.key] ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              placeholder={field.placeholder}
              disabled={query.isLoading}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
            />
          </label>
        ))}
      </div>

      {errorMessage ? (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" aria-hidden />
          Guardar negocio
        </Button>
      </div>
    </section>
  )
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Administracion
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">Configuracion</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Mantene catalogos, unidades y datos del negocio sin exponer ids ni valores
            tecnicos de la base de datos.
          </p>
        </header>

        <BusinessSettingsSection />

        <div className="grid gap-6 xl:grid-cols-2">
          {CATALOGS.map((config) => (
            <CatalogSection key={config.id} config={config} />
          ))}
        </div>
      </div>
    </main>
  )
}
