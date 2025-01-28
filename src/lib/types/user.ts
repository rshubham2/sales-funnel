// src/lib/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
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