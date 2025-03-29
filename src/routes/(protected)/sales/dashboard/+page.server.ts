// src/routes/sales/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db as prisma } from '$lib/database';

export const load: PageServerLoad = async ({ locals }) => {
  // Assuming you have user info in locals from your auth system
  const userId = locals.user?.id;
  
  if (!userId) {
    return {
      organizations: []
    };
  }
  
  const organizations = await prisma.organization.findMany({
    where: {
      assignedToId: userId
    },
    select: {
      organizationId: true,
      name: true,
      salesStage: true,
      priority: true,
      lastContactDate: true,
      nextFollowUpDate: true,
      lastActivityNote: true,
      lastActivityType: true,
      tags: true
    },
    orderBy: [
      {
        priority: 'desc'
      },
      {
        nextFollowUpDate: 'asc'
      }
    ]
  });
  
  return {
    organizations
  };
};