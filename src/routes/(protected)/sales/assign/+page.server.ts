// src/routes/sales/organizations/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db as prisma } from '$lib/database';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
  const [organizations, users] = await Promise.all([
    prisma.organization.findMany({
      include: {
        contacts: true,
        assignedTo: {
          select: {
            id: true,
            username: true
          }
        }
      }
    }),
    // Only fetch users if current user is admin
    locals.user?.role === 'ADMIN' ? 
      prisma.user.findMany({
        select: {
          id: true,
          username: true
        }
      }) : 
      Promise.resolve([])
  ]);

  return {
    organizations,
    users,
    user: locals.user
  };
}) satisfies PageServerLoad;

export const actions = {
  assignOrganization: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    const data = await request.formData();
    const organizationId = data.get('organizationId')?.toString();

    if (!organizationId) {
      return fail(400, { message: 'Organization ID is required' });
    }

    try {
      // Check if organization is already assigned
      const organization = await prisma.organization.findUnique({
        where: { organizationId },
        include: { assignedTo: true }
      });

      if (!organization) {
        return fail(404, { message: 'Organization not found' });
      }

      if (organization.assignedTo) {
        return fail(400, { message: 'Organization is already assigned' });
      }

      console.log("localdata",locals);
      // Assign organization to user
      await prisma.organization.update({
        where: { organizationId },
        data: {
          assignedToId: locals.user.id,
          salesStage: 'LEAD',
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error assigning organization:', error);
      return fail(500, { message: 'Failed to assign organization' });
    }
  },
  bulkAssign: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const organizationIds = JSON.parse(formData.get('organizationIds')?.toString() || '[]');
      const assignToUserId = formData.get('assignToUserId')?.toString() || locals.user.id;

      if (!organizationIds.length) {
        return fail(400, { message: 'No organizations selected' });
      }

      // Loop through each organization and assign them one by one
      for (const orgId of organizationIds) {
        await prisma.organization.update({
          where: {
            organizationId: orgId,
          },
          data: {
            assignedToId: assignToUserId
          }
        });
      }

      return {
        success: true,
        message: `Successfully assigned ${organizationIds.length} organizations`
      };

    } catch (error) {
      console.error('Error in bulk assign:', error);
      return fail(500, { 
        success: false,
        message: error.message || 'Failed to assign organizations'
      });
    }
  },
  bulkUpdatePriority: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'Unauthorized' });
    }

    try {
      const formData = await request.formData();
      const organizationIds = JSON.parse(formData.get('organizationIds')?.toString() || '[]');
      const newPriority = formData.get('priority')?.toString();

      if (!organizationIds.length) {
        return fail(400, { message: 'No organizations selected' });
      }

      if (!newPriority || !['HIGH', 'MEDIUM', 'LOW'].includes(newPriority)) {
        return fail(400, { message: 'Invalid priority value' });
      }

      // Update priority one by one
      for (const orgId of organizationIds) {
        await prisma.organization.update({
          where: {
            organizationId: orgId,
          },
          data: {
            priority: newPriority
          }
        });
      }

      return {
        success: true,
        message: `Successfully updated priority for ${organizationIds.length} organizations`
      };

    } catch (error) {
      console.error('Error in bulk priority update:', error);
      return fail(500, {
        success: false,
        message: error.message || 'Failed to update priorities'
      });
    }
  }
} satisfies Actions;