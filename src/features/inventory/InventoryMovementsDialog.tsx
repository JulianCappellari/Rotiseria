"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownCircle, ArrowUpCircle, History, MinusCircle } from "lucide-react"

import { api } from "@/lib/api"
import { getStockMovementLabel } from "@/lib/display-labels"
import { formatDateTime } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type StockMovement = {
  id: string
  type: string
  quantity: number
  reason?: string | null
  referenceType?: string | null
  referenceId?: string | null
  createdAt: string
  inventoryItem?: {
    name?: string
    unit?: {
      abbreviation?: string
      name?: string
    }
  }
}

type InventoryMovementsDialogProps = {
  inventoryItemId: string
  inventoryItemName?: string
}

function unwrapApiData<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }

  return value as T
}

function getMovementTone(type: string) {
  const normalizedType = type.toUpperCase()

  if (["PURCHASE", "RETURN", "ADJUSTMENT_IN"].includes(normalizedType)) {
    return {
      Icon: ArrowUpCircle,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    }
  }

  if (["WASTE", "ORDER_CONSUMPTION", "CONSUMPTION", "ADJUSTMENT_OUT"].includes(normalizedType)) {
    return {
      Icon: ArrowDownCircle,
      className: "bg-red-50 text-red-700 ring-red-100",
    }
  }

  return {
    Icon: MinusCircle,
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  }
}

export function InventoryMovementsDialog({
  inventoryItemId,
  inventoryItemName,
}: InventoryMovementsDialogProps) {
  const [open, setOpen] = useState(false)
  const { data = [], isLoading } = useQuery({
    queryKey: ["inventory", inventoryItemId, "movements"],
    enabled: open,
    queryFn: async () =>
      unwrapApiData<StockMovement[]>(
        await api.get(`/inventory/${inventoryItemId}/movements`),
      ),
  })

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <History className="mr-2 h-4 w-4" aria-hidden />
        Historial
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Movimientos de stock{inventoryItemName ? ` · ${inventoryItemName}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200">
            {isLoading ? (
              <div className="p-4 text-sm text-slate-500">Cargando movimientos...</div>
            ) : data.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">
                Todavia no hay movimientos registrados para este insumo.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {data.map((movement) => {
                  const { Icon, className } = getMovementTone(movement.type)
                  const unit =
                    movement.inventoryItem?.unit?.abbreviation ??
                    movement.inventoryItem?.unit?.name ??
                    ""

                  return (
                    <div
                      key={movement.id}
                      className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-md ring-1 ${className}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-950">
                            {getStockMovementLabel(movement.type)}
                          </span>
                          {movement.referenceType ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {movement.referenceType}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDateTime(movement.createdAt)}
                          {movement.reason ? ` · ${movement.reason}` : ""}
                        </p>
                      </div>

                      <strong className="text-right text-slate-950">
                        {movement.quantity} {unit}
                      </strong>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
