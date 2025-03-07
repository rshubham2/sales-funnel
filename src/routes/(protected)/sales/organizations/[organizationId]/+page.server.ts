// src/routes/organizations/[organizationId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db as prisma } from '$lib/database';

export const load: PageServerLoad = async ({ params }) => {
  const { organizationId } = params;

  const organization = await prisma.organization.findUnique({
    where: { organizationId },
    include: {
      contacts: true,
      leads: true,
      qualification: true,
      presentation: true,
      POC: true,
      proposal: true,
      negotiation: true,
      order: true,
      assignedTo: {
        select: {
          username: true,
          email: true
        }
      }
    }
  });

  if (!organization) {
    throw error(404, 'Organization not found');
  }

  return { organization };
};