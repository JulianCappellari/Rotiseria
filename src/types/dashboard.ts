export type DashboardSummary = {
  todaySalesInCents: number;
  todayPaidInCents: number;
  todayExpensesInCents: number;
  estimatedProfitInCents: number;
  totalOrdersToday: number;
  pendingOrders: number;
  lowStockCount: number;
  lowStock: {
    id: string;
    name: string;
    currentStock: string;
    minStock: string;
    unit: {
      symbol: string;
    };
  }[];
  recentOrders: {
    id: string;
    orderNumber: number;
    status: string;
    totalInCents: number;
    createdAt: string;
  }[];
};