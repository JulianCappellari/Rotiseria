export type Report = {
  salesInCents: number;
  paidInCents: number;
  pendingPaymentInCents: number;
  expensesInCents: number;
  purchasesInCents: number;
  estimatedProductsCostInCents: number;
  estimatedGrossProfitInCents: number;
  estimatedNetProfitInCents: number;
  cashBalanceInCents: number;
  ordersCount: number;
  cancelledOrdersCount: number;
  averageTicketInCents: number;
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    totalInCents: number;
  }[];
  expensesByCategory: {
    categoryName: string;
    totalInCents: number;
  }[];
  salesByPaymentMethod: {
    method: string;
    totalInCents: number;
  }[];
};