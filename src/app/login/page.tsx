"use client";

import { FormEvent, useState } from "react";
import { ChefHat, LockKeyhole, LogIn, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { getApiErrorMessage } from "@/lib/api-error";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username || !password) {
      toast.error("Completa usuario y contrasena");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username, password });
      toast.success("Sesion iniciada");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "No se pudo iniciar sesion con esos datos")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-[42vh] items-end bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.35),transparent_34%),linear-gradient(135deg,#111827,#020617)] p-6 md:p-10 lg:min-h-screen">
          <div className="max-w-xl space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-950/40">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                Roticeria
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                Control local para pedidos, caja y stock.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Acceso simple para proteger la app cuando la usan varias
                personas en el local.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-10 text-slate-950 md:px-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-orange-600">
                Iniciar sesion
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Entrar al sistema
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="h-11 pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 pl-9"
                    autoComplete="current-password"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 h-11 w-full"
              disabled={isLoading || isSubmitting}
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              Usa las credenciales locales configuradas para este equipo.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
