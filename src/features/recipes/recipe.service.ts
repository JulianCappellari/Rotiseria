import { api } from "@/lib/api";
import { RecipeItem } from "@/types/recipe";

export async function getRecipeByProduct(productId: string) {
  const res = await api.get<RecipeItem[]>(`/recipes/product/${productId}`);
  return res.data;
}

export async function createRecipeItem(data: {
  productId: string;
  inventoryItemId: string;
  quantity: number;
  wastePercentage: number;
}) {
  const res = await api.post<RecipeItem>("/recipes", data);
  return res.data;
}

export async function deleteRecipeItem(id: string) {
  const res = await api.delete(`/recipes/${id}`);
  return res.data;
}