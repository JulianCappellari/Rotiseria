import { ShoppingBag, Wallet, CreditCard, AlertCircle } from "lucide-react";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/formatters";
import { StatCard } from "@/components/layout/StatCard";

export function OrdersSummary({ orders }: { orders: Order[] }) {
  const validOrders = orders.filter((o) => o.status !== "CANCELLED");

  const totalSold = validOrders.reduce((acc, o) => acc + o.totalInCents, 0);
  const totalPaid = validOrders.reduce((acc, o) => acc + o.paidAmountInCents, 0);
  const pending = totalSold - totalPaid;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Pedidos" value={orders.length} icon={ShoppingBag} tone="blue" />
      <StatCard title="Vendido" value={formatCurrency(totalSold)} icon={Wallet} />
      <StatCard
        title="Cobrado"
        value={formatCurrency(totalPaid)}
        icon={CreditCard}
        tone="green"
      />
      <StatCard
        title="Pendiente"
        value={formatCurrency(pending)}
        icon={AlertCircle}
        tone={pending > 0 ? "red" : "slate"}
      />
    </div>
  );
}
