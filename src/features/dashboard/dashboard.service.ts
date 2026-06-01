import { api } from "@/lib/api";
import { DashboardSummary } from "@/types/dashboard";

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummary>("/dashboard");
  return response.data;
}