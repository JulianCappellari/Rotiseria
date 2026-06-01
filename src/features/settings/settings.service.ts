import { api } from "@/lib/api";
import { BusinessSettings } from "@/types/business-settings";
import { ExpenseCategory } from "@/types/expense";
import { ProductCategory } from "@/types/product-category";
import { Unit } from "@/types/unit";

export type ProductCategoryType = "FOOD" | "DRINK" | "COMBO" | "OTHER";

export type ProductCategoryInput = {
  name: string;
  type: ProductCategoryType;
  isActive?: boolean;
};

export type ExpenseCategoryInput = {
  name: string;
  isActive?: boolean;
};

export type UnitInput = {
  name: string;
  symbol: string;
};

export type BusinessSettingsInput = {
  name: string;
  phone?: string | null;
  address?: string | null;
  taxId?: string | null;
  receiptFooter?: string | null;
};

export async function getBusinessSettings() {
  const response = await api.get<BusinessSettings>("/business-settings");
  return response.data;
}

export async function updateBusinessSettings(data: BusinessSettingsInput) {
  const response = await api.patch<BusinessSettings>("/business-settings", data);
  return response.data;
}

export async function getProductCategoriesForSettings() {
  const response = await api.get<ProductCategory[]>("/product-categories");
  return response.data;
}

export async function createProductCategory(data: ProductCategoryInput) {
  const response = await api.post<ProductCategory>("/product-categories", data);
  return response.data;
}

export async function updateProductCategory(input: {
  id: string;
  data: Partial<ProductCategoryInput>;
}) {
  const response = await api.patch<ProductCategory>(
    `/product-categories/${input.id}`,
    input.data
  );
  return response.data;
}

export async function removeProductCategory(id: string) {
  await api.delete(`/product-categories/${id}`);
}

export async function getExpenseCategoriesForSettings() {
  const response = await api.get<ExpenseCategory[]>("/expense-categories");
  return response.data;
}

export async function createExpenseCategory(data: ExpenseCategoryInput) {
  const response = await api.post<ExpenseCategory>("/expense-categories", data);
  return response.data;
}

export async function updateExpenseCategory(input: {
  id: string;
  data: Partial<ExpenseCategoryInput>;
}) {
  const response = await api.patch<ExpenseCategory>(
    `/expense-categories/${input.id}`,
    input.data
  );
  return response.data;
}

export async function removeExpenseCategory(id: string) {
  await api.delete(`/expense-categories/${id}`);
}

export async function getUnitsForSettings() {
  const response = await api.get<Unit[]>("/units");
  return response.data;
}

export async function createUnit(data: UnitInput) {
  const response = await api.post<Unit>("/units", data);
  return response.data;
}

export async function updateUnit(input: {
  id: string;
  data: Partial<UnitInput>;
}) {
  const response = await api.patch<Unit>(`/units/${input.id}`, input.data);
  return response.data;
}

export async function removeUnit(id: string) {
  await api.delete(`/units/${id}`);
}
