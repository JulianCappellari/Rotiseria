import { api } from "@/lib/api";
import { Unit } from "@/types/unit";

export async function getUnits() {
  const res = await api.get<Unit[]>("/units");
  return res.data;
}