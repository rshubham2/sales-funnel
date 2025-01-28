// src/routes/sales/organizations/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db as prisma } from '$lib/database';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
  const organizations = await prisma.organization.findMany({
    include: {
      contacts: true,
      assignedTo: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });

  return {
    organizations,
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
          assignedToId: locals.user.id
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error assigning organization:', error);
      return fail(500, { message: 'Failed to assign organization' });
    }
  }
} satisfies Actions;