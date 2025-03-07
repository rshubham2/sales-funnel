// src/routes/api/sales/presentation/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';
import { error } from '@sveltejs/kit';

// GET handler to fetch presentation data
export const GET: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    const organizationId = url.searchParams.get('organizationId');
    
    if (!id && !organizationId) {
      throw error(400, 'Either id or organizationId is required');
    }
    
    let presentation;
    
    if (id) {
      // Fetch specific presentation by ID
      presentation = await prisma.presentation.findUnique({
        where: { id },
        include: {
          followups: true,
          files: true
        }
      });
    } else {
      // Fetch presentation for organization
      presentation = await prisma.presentation.findFirst({
        where: { id: organizationId },
        include: {
          followups: true,
          files: true
        }
      });
    }
    
    if (!presentation) {
      throw error(404, 'Presentation not found');
    }
    
    return json(presentation);
  } catch (err) {
    console.error('Error fetching presentation:', err);
    throw error(500, 'Failed to fetch presentation data');
  }
};

// POST handler to create new presentation
export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      organizationId, 
      presentationDate, 
      isQualified, 
      decisionMakerInvolved, 
      formalProposalRequested, 
      budgetApproved, 
      caseClosureTimeFrame, 
      isPOC, 
      status, 
      dropReason,
      nextSalesStage 
    } = data;
    
    if (!organizationId) {
      throw error(400, 'Organization ID is required');
    }
    
    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });
    
    if (!organization) {
      throw error(404, 'Organization not found');
    }
    
    // Create new presentation
    const presentation = await prisma.presentation.create({
      data: {
        presentationDate: presentationDate ? new Date(presentationDate) : null,
        isQualified,
        decisionMakerInvolved,
        formalProposalRequested,
        budgetApproved,
        caseClosureTimeFrame,
        isPOC,
        status,
        dropReason,
        organization: {
          connect: { organizationId }
        }
      }
    });
    
    // If status is MOVED_TO_NEXT, update organization sales stage
    if (status === 'MOVED_TO_NEXT' && nextSalesStage) {
      await prisma.organization.update({
        where: { organizationId },
        data: { salesStage: nextSalesStage }
      });
    }
    
    return json(presentation);
  } catch (err) {
    console.error('Error creating presentation:', err);
    throw error(500, 'Failed to create presentation data');
  }
};

// PUT handler to update existing presentation
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      id,
      organizationId,
      presentationDate, 
      isQualified, 
      decisionMakerInvolved, 
      formalProposalRequested, 
      budgetApproved, 
      caseClosureTimeFrame, 
      isPOC, 
      status, 
      dropReason,
      nextSalesStage 
    } = data;
    
    if (!id) {
      throw error(400, 'Presentation ID is required');
    }
    
    // Check if presentation exists
    const existingPresentation = await prisma.presentation.findUnique({
      where: { id }
    });
    
    if (!existingPresentation) {
      throw error(404, 'Presentation not found');
    }
    
    // Update presentation
    const updatedPresentation = await prisma.presentation.update({
      where: { id },
      data: {
        presentationDate: presentationDate ? new Date(presentationDate) : null,
        isQualified,
        decisionMakerInvolved,
        formalProposalRequested,
        budgetApproved,
        caseClosureTimeFrame,
        isPOC,
        status,
        dropReason
      }
    });
    
    // If status is MOVED_TO_NEXT, update organization sales stage
    if (status === 'MOVED_TO_NEXT' && nextSalesStage && organizationId) {
      await prisma.organization.update({
        where: { organizationId },
        data: { salesStage: nextSalesStage }
      });
    }
    
    return json(updatedPresentation);
  } catch (err) {
    console.error('Error updating presentation:', err);
    throw error(500, 'Failed to update presentation data');
  }
};