// src/routes/api/sales/poc/[organizationId]/followups/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

// GET: Retrieve all followups for a POC
export const GET: RequestHandler = async ({ params }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    // Find POC for this organization
    const poc = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!poc) {
      return json({ message: 'No POC found for this organization' }, { status: 404 });
    }
    
    // Get all followups for this POC
    const followups = await prisma.pOCFollowup.findMany({
      where: {
        pocId: poc.id
      },
      orderBy: {
        followupDate: 'desc'
      }
    });
    
    return json(followups, { status: 200 });
  } catch (error) {
    console.error('Error retrieving POC followups:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve POC followups' },
      { status: 500 }
    );
  }
};