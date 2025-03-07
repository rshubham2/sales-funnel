// src/routes/api/organizations/[orgId]/stage/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';
import { error } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const orgId = params.orgId;
  const user = locals.user;

  if (!user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const { stage } = await request.json();

    if (!stage) {
      throw error(400, 'Stage is required');
    }

    // Validate stage enum
    const validStages = ['PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 'POC', 'PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST'];
    if (!validStages.includes(stage)) {
      throw error(400, 'Invalid stage');
    }

    // Get current organization
    const currentOrg = await prisma.organization.findUnique({
      where: { organizationId: orgId },
      select: { assignedToId: true }
    });

    if (!currentOrg) {
      throw error(404, 'Organization not found');
    }

    // Check permissions
    const isAdmin = user.role === 'ADMIN';
    const isAssigned = currentOrg.assignedToId === user.id;

    if (!isAdmin && !isAssigned) {
      throw error(403, 'Not authorized to update this organization');
    }

    // Update the organization stage
    const updatedOrg = await prisma.organization.update({
      where: { organizationId: orgId },
      data: {
        salesStage: stage,
        lastActivityType: 'STAGE_UPDATE',
        lastActivityNote: `Stage updated to ${stage}`,
        lastContactDate: new Date()
      }
    });

    // Log the stage change
    await prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        activityType: 'STAGE_UPDATE',
        description: `Sales stage updated from ${currentOrg.salesStage} to ${stage}`,
        timestamp: new Date()
      }
    });

    return json(updatedOrg);
  } catch (err) {
    console.error('Error updating stage:', err);
    
    if (err.status) {
      throw error(err.status, err.message);
    }
    
    throw error(500, 'Failed to update stage');
  }
};