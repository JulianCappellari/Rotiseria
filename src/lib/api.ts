import axios from "axios";

import { getStoredAuthToken } from "@/features/auth/auth.storage";

function resolveApiBaseUrl() {
  // En el navegador/Electron siempre usamos el mismo origen (Next hace proxy a :4000).
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";
}

export const api = axios.create({
  withCredentials: true,
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = getStoredAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
