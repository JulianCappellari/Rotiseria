export type CashSession = {
  id: string;
  openedAt: string;
  closedAt?: string | null;
  openingAmountInCents: number;
  closingAmountInCents?: number | null;
  expectedAmountInCents?: number | null;
  differenceInCents?: number | null;
  notes?: string | null;
};