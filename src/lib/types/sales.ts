// src/lib/types/sales.ts
export interface SalesMetrics {
  totalValue: number;
  count: number;
  averageValue: number;
  organizations: [];
}

export interface StageActivity {
  date: Date;
  type: string;
  note: string;
  userId: string;
}

export interface FollowUpTask {
  id: string;
  organizationId: string;
  dueDate: Date;
  type: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
}