export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// src/lib/types.ts
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type SalesStage = 
  | 'PROSPECT'
  | 'LEAD'
  | 'QUALIFICATION'
  | 'PRESENTATION'
  | 'POC'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'ORDER'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface Contact {
  name: string;
  email: string;
  designation: string;
  department: string;
  mobile: string;
}

export interface AssignedUser {
  id: string;
  username: string;
}

export interface Organization {
  organizationId: string;
  name: string;
  address: string;
  website: string;
  salesStage: SalesStage;
  priority: Priority;
  contacts: Contact[];
  assignedTo: AssignedUser | null;
  assignedToId: string | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
