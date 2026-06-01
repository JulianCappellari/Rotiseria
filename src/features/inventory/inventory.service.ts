import { api } from "@/lib/api";
import { InventoryItem, StockMovement, StockMovementType } from "@/types/inventory";

export type CreateStockMovementInput = {
  inventoryItemId: string;
  type: StockMovementType;
  quantity: number;
  unitCostInCents?: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
};


export async function getInventoryItems() {
  const response = await api.get<InventoryItem[]>("/inventory");
  return response.data;
}

export async function createStockMovement(data: CreateStockMovementInput) {
  const response = await api.post("/stock-movements", data);
  return response.data;
}
export type CreateInventoryItemInput = {
  name: string;
  category: string;
  unitId: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  costPerUnitInCents?: number;
  isPerishable: boolean;
  expirationDays?: number;
  barcode?: string;
};

export async function createInventoryItem(data: CreateInventoryItemInput) {
  const response = await api.post<InventoryItem>("/inventory", data);
  return response.data;
}

export type UpdateInventoryItemInput = Partial<CreateInventoryItemInput>;

export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryItemInput
) {
  const response = await api.patch<InventoryItem>(`/inventory/${id}`, data);
  return response.data;
}


export async function getInventoryItem(id: string) {
  const response = await api.get<InventoryItem>(`/inventory/${id}`);
  return response.data;
}

export async function getInventoryItemMovements(id: string) {
  const response = await api.get<StockMovement[]>(`/inventory/${id}/movements`);
  return response.data;
}

