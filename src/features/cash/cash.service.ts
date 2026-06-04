import { api } from "@/lib/api";
import { CashSession } from "@/types/cash-session";

export async function getCashSessions() {
  const res = await api.get<CashSession[]>("/cash-sessions");
  return res.data;
}

export async function getOpenCashSession() {
  const res = await api.get<CashSession | null>("/cash-sessions/open");
  return res.data;
}

export async function openCashSession(data: {
  openedByName: string;
  openingAmountInCents: number;
  openingAmountsInCents?: Record<string, number>;
  notes?: string;
}) {
  const res = await api.post<CashSession>("/cash-sessions/open", data);
  return res.data;
}

export async function closeCashSession(id: string, data: {
  closedByName: string;
  closingAmountInCents: number;
  closingAmountsInCents?: Record<string, number>;
  notes?: string;
}) {
  const res = await api.patch<CashSession>(`/cash-sessions/${id}/close`, data);
  return res.data;
}
