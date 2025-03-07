// src/lib/stores/dashboardStore.ts
import { writable } from 'svelte/store';

export const dashboardStore = writable({
  loading: true,
  error: null,
  data: {
    organizations: [],
    users: [],
    orders: [],
    metrics: {
      totalRevenue: 0,
      activeDeals: 0,
      conversionRate: 0,
      avgDealSize: 0,
      totalUsers: 0,
      monthlyLeads: 0
    },
    stageDistribution: [],
    revenueTimeline: [],
    topPerformers: []
  }
});