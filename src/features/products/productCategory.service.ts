import { api } from "@/lib/api";
import { ProductCategory } from "@/types/product-category";

export async function getProductCategories() {
  const response = await api.get<ProductCategory[]>("/product-categories");
  return response.data;
}