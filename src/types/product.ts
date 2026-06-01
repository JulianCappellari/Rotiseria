export type Product = {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  saleType: "UNIT" | "WEIGHT" | "PORTION";
  basePriceInCents: number;
  costInCents?: number | null;
  isActive: boolean;
  isRecipeBased: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  variants: {
    id: string;
    name: string;
    priceInCents: number;
  }[];
  recipeItems: unknown[];
};