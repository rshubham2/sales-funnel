// lib/types/dashboard.ts
export interface DashboardResponse {
  organizations: {
    totalCount: number;
    stageDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    tags: Array<{ tag: string; count: number }>;
  };
  sales: {
    totalMRR: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    conversionRates: Record<string, number>;
  };
  leads: {
    totalLeads: number;
    verticalDistribution: Record<string, number>;
    avgBusinessValue: number;
  };
  poc: {
    totalPOCs: number;
    successRate: number;
    avgDuration: number;
    typeDistribution: Record<string, number>;
  };
  orders: {
    totalOrders: number;
    winRate: number;
    totalRevenue: number;
    statusDistribution: Record<string, number>;
  };
}