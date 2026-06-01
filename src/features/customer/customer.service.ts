import { api } from "@/lib/api";
import { Customer } from "@/types/customer";

export async function getCustomers() {
  const response = await api.get<Customer[]>("/customers");
  return response.data;
}