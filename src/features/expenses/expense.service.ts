import { api } from "@/lib/api";
import { Expense, ExpenseCategory } from "@/types/expense";

export type CreateExpenseInput = {
  categoryId?: string;
  description: string;
  amountInCents: number;
  paymentMethod?: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT" | "QR" | "MERCADO_PAGO";
};

export async function getExpenses(date?: string) {
  const response = await api.get<Expense[]>("/expenses", {
    params: { date },
  });
  return response.data;
}

export async function createExpense(data: CreateExpenseInput) {
  const response = await api.post<Expense>("/expenses", data);
  return response.data;
}

export async function getExpenseCategories() {
  const response = await api.get<ExpenseCategory[]>("/expense-categories");
  return response.data.filter((category) => category.isActive !== false);
}
