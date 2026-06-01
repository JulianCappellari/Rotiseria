import { api } from "@/lib/api";
import { Product } from "@/types/product";

export type CreateProductInput = {
  name: string;
  description?: string;
  sku?: string;
  categoryId: string;
  saleType: "UNIT" | "WEIGHT" | "PORTION";
  basePriceInCents: number;
  costInCents?: number;
  isRecipeBased: boolean;
};

export async function getProducts() {
  const response = await api.get<Product[]>("/products");
  return response.data;
}

export async function createProduct(data: CreateProductInput) {
  const response = await api.post<Product>("/products", data);
  return response.data;
}

export async function deleteProduct(id: string) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
export type UpdateProductInput = Partial<CreateProductInput>;

export async function updateProduct(id: string, data: UpdateProductInput) {
  const response = await api.patch<Product>(`/products/${id}`, data);
  return response.data;
}