import { Badge } from "@/components/ui/badge";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/business-labels";

type Props = {
  type: "order" | "payment" | "stock" | "active" | "recipe";
  value: string | boolean;
};

const orderTone: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  IN_PREPARATION: "border-sky-200 bg-sky-50 text-sky-700",
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DELIVERED: "border-slate-200 bg-slate-50 text-slate-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const paymentTone: Record<string, string> = {
  UNPAID: "border-red-200 bg-red-50 text-red-700",
  PARTIAL: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ type, value }: Props) {
  if (type === "order") {
    const status = String(value);

    return (
      <Badge variant="outline" className={orderTone[status] || ""}>
        {orderStatusLabel(status)}
      </Badge>
    );
  }

  if (type === "payment") {
    const status = String(value);

    return (
      <Badge variant="outline" className={paymentTone[status] || ""}>
        {paymentStatusLabel(status)}
      </Badge>
    );
  }

  if (type === "stock") {
    return value ? (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
        Stock bajo
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        Correcto
      </Badge>
    );
  }

  if (type === "active") {
    return value ? (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        Activo
      </Badge>
    ) : (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
        Inactivo
      </Badge>
    );
  }

  if (type === "recipe") {
    return value ? (
      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
        Con receta
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border-slate-200 bg-slate-50 text-slate-700"
      >
        Sin receta
      </Badge>
    );
  }

  return <Badge>{String(value)}</Badge>;
}
