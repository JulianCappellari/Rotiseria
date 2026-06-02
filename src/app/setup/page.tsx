"use client";

import { FormEvent, useState } from "react";
import { Building2, ChefHat, KeyRound, User, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthProvider";

export default function SetupPage() {
  const { setupInitialUser, isLoading } = useAuth();
  const [form, setForm] = useState({
    businessName: "",
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.businessName.trim() ||
      !form.name.trim() ||
      !form.username.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Completa todos los campos");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await setupInitialUser({
        businessName: form.businessName.trim(),
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Usuario inicial creado");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "No se pudo crear el usuario inicial")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-[40vh] items-end bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.28),transparent_32%),linear-gradient(135deg,#111827,#020617)] p-6 md:p-10 lg:min-h-screen">
          <div className="max-w-xl space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-950/40">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                Primer inicio
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                Crea el usuario inicial de este equipo.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Estos datos quedan guardados solo en la base SQLite local de
                esta PC.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-10 text-slate-950 md:px-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-orange-600">
                Configuracion inicial
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Datos del negocio y administrador
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(event) =>
                      updateField("businessName", event.target.value)
                    }
                    className="h-11 pl-9"
                    placeholder="Ej: Roticeria Centro"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Tu nombre</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="h-11 pl-9"
                    placeholder="Administrador"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    className="h-11 pl-9"
                    autoComplete="username"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    className="h-11 pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    className="h-11 pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-6 h-11 w-full"
              disabled={isLoading || isSubmitting}
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Creando..." : "Crear usuario inicial"}
            </Button>

            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              Si instalas en otra PC, se va a crear otra base local y otro
              usuario inicial independiente.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
