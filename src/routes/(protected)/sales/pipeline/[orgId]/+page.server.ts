// src/routes/sales/pipeline/[orgId]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db as prisma } from '$lib/database';

export const load: PageServerLoad = async ({ params, locals }) => {
  const orgId = params.orgId;
  
  if (!orgId) {
    throw error(400, 'Organization ID is required');
  }
  
  // Make sure user is authenticated
  const user = locals.user;
  if (!user) {
    throw error(401, 'Unauthorized');
  }
  
  try {
    // Get organization with all stages data
    const organization = await prisma.organization.findUnique({
      where: {
        organizationId: orgId
      },
      include: {
        leads: true,
        qualification: {
          include: {
            followups: true 
          }
        },
        presentation: {
          include: {
            followups: true,
            files: true
          }
        },
        POC: true,
        proposal: true,
        negotiation: true,
        order: true,
        contacts: true
      }
    });
    
    if (!organization) {
      throw error(404, 'Organization not found');
    }
    
    // Check if user is assigned to this organization or is an admin
    const isAdmin = user.role === 'ADMIN'; // Assuming 1 is admin role ID
    const isAssigned = organization.assignedToId === user.id;
    
    if (!isAdmin && !isAssigned) {
      throw error(403, 'You do not have permission to view this organization');
    }
    
    // Define the order of stages in the sales pipeline
    const stageOrder = [
      'PROSPECT',
      'LEAD',
      'QUALIFICATION', 
      'PRESENTATION', 
      'POC', 
      'PROPOSAL', 
      'NEGOTIATION', 
      'ORDER',
      'CLOSED_WON',
      'CLOSED_LOST'
    ];
    
    // Get the current stage index
    const currentStageIndex = stageOrder.indexOf(organization.salesStage);
    if (currentStageIndex === -1) {
      // If stage is not found, allow all stages as fallback
      return {
        organization,
        availableStages: ['lead', 'qualification', 'presentation', 'poc', 'proposal', 'negotiation', 'order']
      };
    }
    
    // Filter available stages based on the current stage
    const availableStages = stageOrder
      .slice(0, currentStageIndex + 1)
      .map(stage => stage.toLowerCase());
    
    // Special case for POC which is all caps in the model
    const pocIndex = availableStages.indexOf('poc');
    if (pocIndex !== -1) {
      availableStages[pocIndex] = 'poc';
    }
    
    return {
      organization,
      availableStages
    };
  } catch (err) {
    console.error('Error loading organization:', err);
    throw error(500, 'Failed to load organization data');
  }
};