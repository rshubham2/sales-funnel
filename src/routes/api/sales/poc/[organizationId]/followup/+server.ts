// src/routes/api/sales/poc/[organizationId]/followup/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

// POST: Create new POC followup
export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Find the existing POC for this organization
    const existingPOC = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!existingPOC) {
      return json({ error: 'POC not found for this organization' }, { status: 404 });
    }
    
    // Create a new followup
    const followup = await prisma.pOCFollowup.create({
      data: {
        remark: data.remark,
        followupDate: new Date(data.followupDate),
        poc: {
          connect: {
            id: existingPOC.id
          }
        }
      }
    });
    
    // Update organization's next followup date and last activity
    await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        nextFollowUpDate: new Date(data.followupDate),
        lastActivityType: 'POC Followup Added',
        lastActivityNote: data.remark.substring(0, 100) + (data.remark.length > 100 ? '...' : '')
      }
    });
    
    return json(followup, { status: 201 });
  } catch (error) {
    console.error('Error creating POC followup:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create POC followup' },
      { status: 500 }
    );
  }
};