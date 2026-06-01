export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
};

export type Purchase = {
  id: string;
  totalInCents: number;
  invoiceNumber?: string | null;
  notes?: string | null;
  businessDate: string;
  createdAt: string;
  supplier?: Supplier | null;
  items: {
    id: string;
    quantity: string;
    unitCostInCents: number;
    subtotalInCents: number;
    inventoryItem: {
      id: string;
      name: string;
      unit: {
        symbol: string;
      };
    };
  }[];
};