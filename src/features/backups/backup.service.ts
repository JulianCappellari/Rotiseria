import { api } from "@/lib/api";

export type BackupFile = {
  filename: string;
  sizeInBytes: number;
  createdAt: string;
  modifiedAt: string;
};

export async function getBackups() {
  const res = await api.get<BackupFile[]>("/backups");
  return res.data;
}

export async function createBackup() {
  const res = await api.post("/backups");
  return res.data;
}