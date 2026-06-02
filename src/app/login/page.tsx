"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { KeyRound, Lock, Store, User } from "lucide-react"

import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"

type SetupStatus = {
  needsInitialUser?: boolean
}

function unwrapApiData<T>(value: unknown): T {
  if (value && typeof value === "object" && "data" in value) {
    return (value as { data: T }).data
  }

  return value as T
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      response?: { data?: { message?: string } }
      message?: string
    }

    return (
      maybeError.response?.data?.message ??
      maybeError.message ??
      "No se pudo iniciar sesion"
    )
  }

  return "No se pudo iniciar sesion"
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const setupQuery = useQuery({
    queryKey: ["auth", "setup-status"],
    queryFn: async () =>
      unwrapApiData<SetupStatus>(await api.get("/auth/setup-status")),
  })

  const needsInitialUser = Boolean(setupQuery.data?.needsInitialUser)
  const title = needsInitialUser ? "Crear usuario inicial" : "Ingresar"
  const subtitle = needsInitialUser
    ? "Este usuario protege la base local de esta PC."
    : "Accede al sistema local de la rotiseria."
  const canSubmit = useMemo(() => {
    if (!username.trim() || password.length < 6) {
      return false
    }

    return !needsInitialUser || password === confirmPassword
  }, [confirmPassword, needsInitialUser, password, username])

  const { login } = useAuth()
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    if (!canSubmit) {
      setErrorMessage(
        needsInitialUser
          ? "Completa usuario, contraseña y confirmacion."
          : "Completa usuario y contraseña.",
      )
      return
    }

    try {
      setIsSubmitting(true)
      if (needsInitialUser) {
        await api.post("/auth/setup", {
          username: username.trim(),
          password,
        })
        router.replace("/")
        router.refresh()
      } else {
        await login({
          username: username.trim(),
          password,
        })
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-100 text-slate-950 lg:grid-cols-[1fr_480px]">
      <section className="hidden min-h-screen bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950">
            <Store className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-300">Sistema local</p>
            <h1 className="text-xl font-semibold">Rotiseria</h1>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Operacion protegida
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight">
            Caja, pedidos y stock en una base local propia.
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Cada instalacion usa su usuario y su SQLite en la PC donde corre el
            programa.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
              <KeyRound className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Usuario
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                />
              </div>
            </label>

            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Contraseña
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete={needsInitialUser ? "new-password" : "current-password"}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                />
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-slate-500">Debe tener al menos 6 caracteres</p>
              )}
            </label>

            {needsInitialUser ? (
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Confirmar contraseña
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-slate-950 transition focus:ring-2"
                />
              </label>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={!canSubmit || isSubmitting || setupQuery.isLoading}
          >
            {isSubmitting
              ? "Procesando..."
              : needsInitialUser
                ? "Crear usuario"
                : "Ingresar"}
          </Button>
        </form>
      </section>
    </main>
  )
}
