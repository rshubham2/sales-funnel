// src/routes/(protected)/admin/users/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/database';
import bcrypt from 'bcrypt';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    throw redirect(302, '/dashboard');
  }

  try {
    // Fetch all users with their roles and assigned organizations
    const users = await db.user.findMany({
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
        createdAt: true,
        assignedOrganizations: {
          select: {
            organizationId: true,
            name: true,
            salesStage: true,
            salesFunnelStage: true,
            priority: true,
            leads: {
              select: {
                vertical: true,
                businessExpectationsMRR: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get performance metrics for each user
    const enhancedUsers = users.map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role.name,
      status: user.status,
      createdAt: user.createdAt,
      metrics: {
        totalAssignments: user.assignedOrganizations.length,
        activeDeals: user.assignedOrganizations.filter(org => 
          org.salesStage !== 'CLOSED_WON' && org.salesStage !== 'CLOSED_LOST'
        ).length,
        totalMRR: user.assignedOrganizations.reduce((sum, org) => 
          sum + (org.leads[0]?.businessExpectationsMRR || 0), 0
        ),
        stageDistribution: {
          PROSPECT: user.assignedOrganizations.filter(org => org.salesStage === 'PROSPECT').length,
          LEAD: user.assignedOrganizations.filter(org => org.salesStage === 'LEAD').length,
          QUALIFICATION: user.assignedOrganizations.filter(org => org.salesStage === 'QUALIFICATION').length,
          PRESENTATION: user.assignedOrganizations.filter(org => org.salesStage === 'PRESENTATION').length,
          POC: user.assignedOrganizations.filter(org => org.salesStage === 'POC').length,
          PROPOSAL: user.assignedOrganizations.filter(org => org.salesStage === 'PROPOSAL').length,
          NEGOTIATION: user.assignedOrganizations.filter(org => org.salesStage === 'NEGOTIATION').length,
          ORDER: user.assignedOrganizations.filter(org => org.salesStage === 'ORDER').length,
        }
      },
      assignments: user.assignedOrganizations.map(org => ({
        id: org.organizationId,
        name: org.name,
        stage: org.salesStage,
        funnelStage: org.salesFunnelStage,
        priority: org.priority,
        vertical: org.leads[0]?.vertical || 'N/A',
        mrr: org.leads[0]?.businessExpectationsMRR || 0
      }))
    }));

    return {
      users: enhancedUsers
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      error: 'Failed to fetch users'
    };
  }
};

// ... rest of the actions remain the same ...

export const actions: Actions = {
  create: async ({ request, locals }) => {
    // Ensure only admin can create users
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { message: 'Unauthorized' });
    }

    const data = await request.formData();
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');
    const role = data.get('role');

    // Validate input
    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof role !== 'string' ||
      !username || !email || !password || !role
    ) {
      return fail(400, { message: 'Invalid input' });
    }

    try {
      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return fail(400, { message: 'Username or email already exists' });
      }

      // Find the role
      const userRole = await db.roles.findFirst({
        where: { name: role.toUpperCase() }
      });

      if (!userRole) {
        return fail(400, { message: 'Invalid role' });
      }

      // Create new user
      await db.user.create({
        data: {
          username,
          email,
          passwordHash: await bcrypt.hash(password, 10),
          userAuthToken: crypto.randomUUID(),
          roleId: userRole.id,
          status: 'ACTIVE'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('User creation error:', error);
      return fail(500, { message: 'Failed to create user' });
    }
  },

  update: async ({ request, locals }) => {
    // Ensure only admin can update users
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { message: 'Unauthorized' });
    }

    const data = await request.formData();
    const userId = data.get('id');
    const status = data.get('status');
    const role = data.get('role');

    // Validate input
    if (
      typeof userId !== 'string' ||
      typeof status !== 'string' ||
      typeof role !== 'string' ||
      !userId || !status || !role
    ) {
      return fail(400, { message: 'Invalid input' });
    }

    try {
      // Find the role
      const userRole = await db.roles.findFirst({
        where: { name: role.toUpperCase() }
      });

      if (!userRole) {
        return fail(400, { message: 'Invalid role' });
      }

      // Update user
      await db.user.update({
        where: { id: userId },
        data: {
          status,
          roleId: userRole.id
        }
      });

      return { success: true };
    } catch (error) {
      console.error('User update error:', error);
      return fail(500, { message: 'Failed to update user' });
    }
  },

  delete: async ({ request, locals }) => {
    // Ensure only admin can delete users
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return fail(403, { message: 'Unauthorized' });
    }

    const data = await request.formData();
    const userId = data.get('id');

    // Validate input
    if (typeof userId !== 'string' || !userId) {
      return fail(400, { message: 'Invalid input' });
    }

    try {
      // Prevent deleting the last admin
      const adminCount = await db.user.count({
        where: { 
          role: { name: 'ADMIN' },
          status: 'ACTIVE' 
        }
      });

      if (adminCount <= 1) {
        return fail(400, { message: 'Cannot delete the last admin user' });
      }

      // Delete user
      await db.user.delete({
        where: { id: userId }
      });

      return { success: true };
    } catch (error) {
      console.error('User deletion error:', error);
      return fail(500, { message: 'Failed to delete user' });
    }
  }
};