import {
  Clock,
  DollarSign,
  ReceiptText,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  getOrdersTotalPaidInCents,
  getOrdersTotalSoldInCents,
  getOrderStatusCounts,
} from "@/lib/order-calculations"
import { formatCurrency } from "@/lib/formatters"
import { Order } from "@/types/order"

type OrdersSummaryProps = {
  orders?: Order[]
  items?: Order[]
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="h-4 w-4 text-orange-600" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function OrdersSummary({ orders, items }: OrdersSummaryProps) {
  const rows = orders ?? items ?? []
  const totalSoldInCents = getOrdersTotalSoldInCents(rows)
  const totalPaidInCents = getOrdersTotalPaidInCents(rows)
  const pendingInCents = Math.max(totalSoldInCents - totalPaidInCents, 0)
  const statusCounts = getOrderStatusCounts(rows)

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={ReceiptText}
          label="Pedidos"
          value={String(rows.length)}
        />
        <SummaryTile
          icon={DollarSign}
          label="Total vendido"
          value={formatCurrency(totalSoldInCents)}
        />
        <SummaryTile
          icon={Wallet}
          label="Total cobrado"
          value={formatCurrency(totalPaidInCents)}
        />
        <SummaryTile
          icon={Clock}
          label="Pendiente de cobro"
          value={formatCurrency(pendingInCents)}
        />
      </div>

      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        {statusCounts.map((item) => (
          <div
            key={item.status}
            className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2"
          >
            <span className="text-sm text-slate-600">{item.label}</span>
            <strong className="text-sm font-semibold text-slate-950">
              {item.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}
