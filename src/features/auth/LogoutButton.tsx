"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <Button type="button" variant="ghost" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden />
      Salir
    </Button>
  )
}
