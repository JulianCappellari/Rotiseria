"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  ClipboardList,
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react"

import { LogoutButton } from "@/features/auth/LogoutButton"

const NAV_ITEMS = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/orders", label: "Pedidos", Icon: ClipboardList },
  { href: "/products", label: "Productos", Icon: Package },
  { href: "/inventory", label: "Stock", Icon: Boxes },
  { href: "/purchases", label: "Compras", Icon: ShoppingCart },
  { href: "/cash", label: "Caja", Icon: CreditCard },
  { href: "/configuracion", label: "Configuracion", Icon: Settings },
]

export function AppNavigation() {
  const pathname = usePathname()

  if (pathname === "/login") {
    return null
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
            R
          </span>
          <span className="hidden sm:inline">Rotiseria</span>
        </Link>

        <div className="hidden items-center gap-1 overflow-x-auto lg:flex">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            )
          })}
        </div>

        <LogoutButton />
      </div>
    </nav>
  )
}
