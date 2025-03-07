// src/routes/api/sales/organization/[organizationId]/stage/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';
import { SalesStage } from '@prisma/client';

// PUT: Update organization's sales stage
export const PUT: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
 
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
 
  try {
    const data = await request.json();
    const { stage } = data;
   
    // Validate if the stage is a valid enum value
    const validStages = Object.values(SalesStage);
    if (!stage || !validStages.includes(stage)) {
      return json({ 
        error: `Valid sales stage is required. Received: ${stage}. Valid values are: ${validStages.join(', ')}` 
      }, { status: 400 });
    }
   
    // Update the organization's sales stage
    const organization = await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        salesStage: stage as SalesStage
      }
    });
   
    return json(organization, { status: 200 });
  } catch (error) {
    console.error('Error updating organization sales stage:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update organization sales stage' },
      { status: 500 }
    );
  }
};