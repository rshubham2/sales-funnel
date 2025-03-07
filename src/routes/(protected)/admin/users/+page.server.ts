// src/routes/admin/users/+page.server.ts
import { db } from '$lib/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const users = await db.user.findMany({
      include: {
        role: true,
        assignedOrganizations: {
          include: {
            contacts: true,
            leads: true,
            qualification: true,
            presentation: true,
            POC: true,
            proposal: true,
            negotiation: true,
            order: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const roles = await db.roles.findMany();

    return {
      users,
      roles,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const actions = {
  updateRole: async ({ request }) => {
    try {
      const data = await request.formData();
      const userId = data.get('userId') as string;
      const roleId = parseInt(data.get('roleId') as string);

      await db.user.update({
        where: { id: userId },
        data: { roleId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating role:', error);
      return { success: false, error: 'Failed to update role' };
    }
  },

  deleteUser: async ({ request }) => {
    try {
      const data = await request.formData();
      const userId = data.get('userId') as string;

      // First update organizations to remove the user assignment
      await db.organization.updateMany({
        where: { assignedToId: userId },
        data: { assignedToId: null }
      });

      // Then delete the user
      await db.user.delete({
        where: { id: userId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }
};