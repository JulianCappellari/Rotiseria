export type RecipeItem = {
  id: string;
  productId: string;
  inventoryItemId: string;
  quantity: string;
  wastePercentage: string;
  inventoryItem: {
    id: string;
    name: string;
    unit: { symbol: string };
  };
};