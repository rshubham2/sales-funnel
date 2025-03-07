// src/routes/organizations/+page.server.ts
import type { PageServerLoad } from './$types';
import { db as prisma } from '$lib/database';

export const load: PageServerLoad = async () => {
  const organizations = await prisma.organization.findMany({
    include: {
      contacts: true,
      assignedTo: {
        select: {
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      lastContactDate: 'desc'
    }
  });

  return { organizations };
};