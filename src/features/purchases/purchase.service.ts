import { api } from "@/lib/api";
import { Purchase } from "@/types/purchase";

export type CreatePurchaseInput = {
  supplierId?: string;
  invoiceNumber?: string;
  notes?: string;
  items: {
    inventoryItemId: string;
    quantity: number;
    unitCostInCents: number;
  }[];
};

export async function getPurchases(date?: string) {
  const res = await api.get<Purchase[]>("/purchases", {
    params: { date },
  });
  return res.data;
}

export async function createPurchase(data: CreatePurchaseInput) {
  const res = await api.post<Purchase>("/purchases", data);
  return res.data;
}
