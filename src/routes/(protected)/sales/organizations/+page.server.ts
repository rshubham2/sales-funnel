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

  // Get unique values for filter dropdowns
  const uniqueStages = [...new Set(organizations.map(org => org.salesStage))];
  const uniquePriorities = [...new Set(organizations.map(org => org.priority))];
  const uniqueTags = [...new Set(organizations.flatMap(org => org.tags || []))];

  return { 
    organizations,
    filterOptions: {
      stages: uniqueStages,
      priorities: uniquePriorities,
      tags: uniqueTags
    }
  };
};