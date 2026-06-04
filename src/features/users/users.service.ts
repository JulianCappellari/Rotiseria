import { api } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export async function getUsers() {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export async function createUser(userData: any) {
  const { data } = await api.post<User>("/users", userData);
  return data;
}

export async function updateUser(id: string, userData: any) {
  const { data } = await api.patch<User>(`/users/${id}`, userData);
  return data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}
