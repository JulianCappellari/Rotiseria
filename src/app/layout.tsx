import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "sonner";
import { AppFrame } from "@/components/layout/AppFrame";

export const metadata: Metadata = {
  title: "Roticería System",
  description: "Sistema de pedidos, stock y caja",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            <AppFrame>{children}</AppFrame>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
