import { api } from "@/lib/api";
import { Customer } from "@/types/customer";

export type CreateCustomerInput = {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
};

export async function getCustomers() {
  const response = await api.get<Customer[]>("/customers");
  return response.data;
}

export async function createCustomer(data: CreateCustomerInput) {
  const response = await api.post<Customer>("/customers", data);
  return response.data;
}
export async function updateCustomer(
  id: string,
  data: Partial<CreateCustomerInput>
) {
  const response = await api.patch<Customer>(`/customers/${id}`, data);
  return response.data;
}