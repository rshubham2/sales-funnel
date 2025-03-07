// src/routes/api/organizations/bulk-assign/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organizationIds } = await request.json();

  try {
    await prisma.organization.updateMany({
      where: {
        organizationId: {
          in: organizationIds
        },
        assignedToId: null // Only update unassigned organizations
      },
      data: {
        assignedToId: locals.user.id
      }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error bulk assigning organizations:', error);
    return json({ error: 'Failed to assign organizations' }, { status: 500 });
  }
};