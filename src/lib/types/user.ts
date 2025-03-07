// src/lib/types/user.ts
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
}

export interface Organization {
  organizationId: string;
  name: string;
  address: string;
  website: string;
  assignedTo: User | null;
  assignedToId: string | null;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SALES' | 'USER';
}

export interface UserUpdateInput {
  id: string;
  role?: 'ADMIN' | 'SALES' | 'USER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}