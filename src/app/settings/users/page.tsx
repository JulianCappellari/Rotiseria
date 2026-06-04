"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, User, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { getUsers, createUser, deleteUser, type User as UserType } from "@/features/users/users.service";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", password: "", role: "EMPLOYEE" });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setFormData({ name: "", username: "", password: "", role: "EMPLOYEE" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios y Empleados</h1>
          <p className="text-sm text-slate-500">Gestiona los accesos y roles del personal.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-slate-500">Cargando...</p>
        ) : (
          users?.map((u) => (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white/50 backdrop-blur-md p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${u.role === "ADMIN" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"}`}>
                    {u.role === "ADMIN" ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{u.name}</h3>
                    <p className="text-sm text-slate-500">@{u.username}</p>
                  </div>
                </div>
                {u.role === "ADMIN" && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Admin</span>}
              </div>
              
              <div className="mt-4 flex items-center justify-end">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => deleteMutation.mutate(u.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">Crear nuevo usuario</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Usuario de acceso</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rol</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="EMPLOYEE">Empleado / Cajero</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-slate-900 text-white hover:bg-slate-800">
                  {createMutation.isPending ? "Guardando..." : "Crear usuario"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
