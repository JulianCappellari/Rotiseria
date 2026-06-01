export type Expense = {
  id: string;
  description: string;
  amountInCents: number;
  paymentMethod?: string | null;
  businessDate: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  isActive: boolean;
};