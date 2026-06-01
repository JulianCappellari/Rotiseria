import { api } from "@/lib/api";
import { Supplier } from "@/types/purchase";

export async function getSuppliers() {
  const res = await api.get<Supplier[]>("/suppliers");
  return res.data;
}

export async function createSupplier(data: {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const res = await api.post<Supplier>("/suppliers", data);
  return res.data;
}
export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }
) {
  const res = await api.patch<Supplier>(`/suppliers/${id}`, data);
  return res.data;
}