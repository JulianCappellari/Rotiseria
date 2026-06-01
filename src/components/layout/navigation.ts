import {
  BarChart3,
  Boxes,
  Handshake,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pedidos", href: "/orders", icon: ShoppingBag },
  { label: "Stock", href: "/inventory", icon: Boxes },
  { label: "Productos", href: "/products", icon: Package },
  { label: "Gastos", href: "/expenses", icon: ReceiptText },
  { label: "Reportes", href: "/reports", icon: BarChart3 },
  { label: "Clientes", href: "/customers", icon: Users },
  { label: "Compras", href: "/purchases", icon: Truck },
  { label: "Proveedores", href: "/suppliers", icon: Handshake },
  { label: "Caja", href: "/cash", icon: Wallet },
  { label: "Configuracion", href: "/settings", icon: Settings },
];

export const routeTitles: Record<string, string> = Object.fromEntries(
  navigationItems.map((item) => [item.href, item.label]),
);

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
