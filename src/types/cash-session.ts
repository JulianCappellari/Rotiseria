export type CashSession = {
  id: string;
  openedByUser?: {
    id: string;
    name: string;
    username?: string;
    role?: string;
  } | null;
  closedByUser?: {
    id: string;
    name: string;
    username?: string;
    role?: string;
  } | null;
  openedByName?: string | null;
  closedByName?: string | null;
  openedAt: string;
  closedAt?: string | null;
  openingAmountInCents: number;
  closingAmountInCents?: number | null;
  expectedAmountInCents?: number | null;
  differenceInCents?: number | null;
  openingAmountsInCents?: Record<string, number> | null;
  closingAmountsInCents?: Record<string, number> | null;
  expectedAmountsInCents?: Record<string, number> | null;
  differenceAmountsInCents?: Record<string, number> | null;
  paymentAmountsInCents?: Record<string, number> | null;
  expenseAmountsInCents?: Record<string, number> | null;
  netAmountsInCents?: Record<string, number> | null;
  paymentsTotalInCents?: number;
  expensesTotalInCents?: number;
  netTotalInCents?: number;
  currentExpectedAmountInCents?: number;
  currentExpectedAmountsInCents?: Record<string, number> | null;
  notes?: string | null;
};
