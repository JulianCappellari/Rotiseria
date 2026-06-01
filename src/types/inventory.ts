export type StockMovementType =
  | "INITIAL"
  | "PURCHASE"
  | "SALE_CONSUMPTION"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "WASTE"
  | "RETURN";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  currentStock: string;
  minStock: string;
  maxStock?: string | null;
  costPerUnitInCents?: number | null;
  isPerishable: boolean;
  isActive: boolean;
  unit: {
    id: string;
    name: string;
    symbol: string;
  };
};

export type StockMovement = {
  id: string;
  inventoryItemId: string;
  type: StockMovementType;
  quantity: string;
  previousStock?: string | null;
  newStock?: string | null;
  unitCostInCents?: number | null;
  reason?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
  inventoryItem: InventoryItem;
  user?: {
    id: string;
    name: string;
  } | null;
};