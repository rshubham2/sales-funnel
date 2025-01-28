// src/lib/services/userService.ts
import { db } from '$lib/database';
import type { User, UserCreateInput, UserUpdateInput } from '$lib/types/user';
import bcrypt from 'bcrypt';

export class UserService {
  static async createUser(data: UserCreateInput): Promise<User> {
    // Find the corresponding role
    const role = await db.roles.findFirst({
      where: { name: data.role }
    });

    if (!role) {
      throw new Error('Invalid role');
    }

    // Check for existing user
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Create user
    return db.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 10),
        userAuthToken: crypto.randomUUID(),
        roleId: role.id,
        status: 'ACTIVE'
      }
    });
  }

  static async updateUser(data: UserUpdateInput): Promise<User> {
    // Find the corresponding role if provided
    const roleData = data.role 
      ? await db.roles.findFirst({ where: { name: data.role } })
      : null;

    // Update user
    return db.user.update({
      where: { id: data.id },
      data: {
        ...(roleData && { roleId: roleData.id }),
        ...(data.status && { status: data.status })
      }
    });
  }

  static async deleteUser(userId: string): Promise<void> {
    // Prevent deleting the last admin
    const adminCount = await db.user.count({
      where: { 
        role: { name: 'ADMIN' },
        status: 'ACTIVE' 
      }
    });

    if (adminCount <= 1) {
      throw new Error('Cannot delete the last admin user');
    }

    await db.user.delete({
      where: { id: userId }
    });
  }

  static async getUserById(userId: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: {
          select: {
            name: true
          }
        },
        createdAt: true
      }
    });
  }

  static async listUsers(filters: {
    search?: string,
    role?: string,
    status?: string
  } = {}): Promise<User[]> {
    return db.user.findMany({
      where: {
        ...(filters.search && {
          OR: [
            { username: { contains: filters.search } },
            { email: { contains: filters.search } }
          ]
        }),
        ...(filters.role && { role: { name: filters.role } }),
        ...(filters.status && { status: filters.status })
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: {
          select: {
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}