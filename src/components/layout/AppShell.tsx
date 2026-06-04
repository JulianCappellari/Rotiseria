import { ReactNode } from "react";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { OrderCreateDialog } from "@/features/orders/OrderCreateDialog";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-5 md:px-6 lg:px-8">
          {children}
        </main>

        <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] shadow-2xl shadow-orange-950/20 sm:bottom-5 sm:right-5">
          <OrderCreateDialog />
        </div>
      </div>
    </div>
  );
}
