// src/lib/utils/stageHelpers.ts
import { db as prisma } from '$lib/database';
import { SalesStage } from '@prisma/client';

/**
 * Updates an organization's sales stage
 * @param organizationId The organization ID
 * @param stage The new sales stage
 * @returns The updated organization
 */
export async function updateOrganizationStage(organizationId: string, stage: SalesStage) {
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  
  try {
    const organization = await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        salesStage: stage
      }
    });
    
    return organization;
  } catch (error) {
    console.error(`Error updating organization stage to ${stage}:`, error);
    throw new Error(`Failed to update organization stage: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Determines if organization can proceed to next stage
 * @param organizationId The organization ID
 * @param currentStage The current stage
 * @param nextStage The desired next stage
 * @returns Boolean indicating if organization can proceed
 */
export async function canProceedToStage(organizationId: string, currentStage: SalesStage, nextStage: SalesStage) {
  // Get stage positions for comparison
  const stageOrder = [
    SalesStage.PROSPECT,
    SalesStage.LEAD,
    SalesStage.QUALIFICATION,
    SalesStage.PRESENTATION,
    SalesStage.POC,
    SalesStage.PROPOSAL,
    SalesStage.NEGOTIATION,
    SalesStage.ORDER,
    SalesStage.CLOSED_WON,
    SalesStage.CLOSED_LOST
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  const nextIndex = stageOrder.indexOf(nextStage);
  
  // Can only proceed forward in the pipeline or stay at current stage
  if (nextIndex < currentIndex) {
    return false;
  }
  
  // Additional logic for specific stages could be added here
  // For example, check if certain requirements are met before proceeding
  
  return true;
}