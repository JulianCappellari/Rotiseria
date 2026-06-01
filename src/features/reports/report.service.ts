import { api } from "@/lib/api";
import { Report } from "@/types/report";

export async function getDailyReport(date?: string) {
  const response = await api.get<Report>("/reports/daily", {
    params: { date },
  });

  return response.data;
}

export async function getMonthlyReport(year?: number, month?: number) {
  const response = await api.get<Report>("/reports/monthly", {
    params: { year, month },
  });

  return response.data;
}