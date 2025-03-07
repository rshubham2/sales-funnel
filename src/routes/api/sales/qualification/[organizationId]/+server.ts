// src/routes/api/sales/qualification/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';


async function updateOrganizationStage(organizationId: string, stage: string) {
  try {
    await prisma.organization.update({
      where: { organizationId },
      data: { salesStage: stage }
    });
    return true;
  } catch (error) {
    console.error('Error updating organization stage:', error);
    return false;
  }
}

// Update the POST handler
export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Create qualification record
    const qualification = await prisma.qualification.create({
      data: {
        isQualified: data.isQualified,
        customerPain: data.customerPain,
        authority: data.authority,
        consequence: data.consequence,
        isTargetProfile: data.isTargetProfile,
        targetProfileReason: data.targetProfileReason,
        isTimingCorrect: data.isTimingCorrect,
        timingReason: data.timingReason,
        agreedForPresentation: data.agreedForPresentation,
        qualificationDate: new Date(data.qualificationDate),
        status: data.status,
        dropReason: data.dropReason,
        organization: {
          connect: { organizationId }
        },
        followups: {
          create: data.followups.map((followup: any) => ({
            remark: followup.remark,
            followupDate: new Date(followup.followupDate)
          }))
        }
      }
    });

    // If status is MOVED_TO_NEXT, update organization's sales stage
    if (data.status === 'MOVED_TO_NEXT') {
      await updateOrganizationStage(organizationId, 'PRESENTATION');
    }
    
    return json(qualification, { status: 201 });
  } catch (error) {
    console.error('Error creating qualification:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create qualification' },
      { status: 500 }
    );
  }
};

// Update the PUT handler similarly
export const PUT: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    const existingQualification = await prisma.qualification.findFirst({
      where: {
        organization: { organizationId }
      }
    });
    
    if (!existingQualification) {
      return json({ error: 'Qualification not found' }, { status: 404 });
    }

    // Delete existing followups
    await prisma.qualificationFollowup.deleteMany({
      where: { qualificationId: existingQualification.id }
    });
    
    // Update qualification
    const qualification = await prisma.qualification.update({
      where: { id: existingQualification.id },
      data: {
        isQualified: data.isQualified,
        customerPain: data.customerPain,
        authority: data.authority,
        consequence: data.consequence,
        isTargetProfile: data.isTargetProfile,
        targetProfileReason: data.targetProfileReason,
        isTimingCorrect: data.isTimingCorrect,
        timingReason: data.timingReason,
        agreedForPresentation: data.agreedForPresentation,
        qualificationDate: new Date(data.qualificationDate),
        status: data.status,
        dropReason: data.dropReason,
        followups: {
          create: data.followups.map((followup: any) => ({
            remark: followup.remark,
            followupDate: new Date(followup.followupDate)
          }))
        }
      }
    });

    // If status is MOVED_TO_NEXT, update organization's sales stage
    if (data.status === 'MOVED_TO_NEXT') {
      await updateOrganizationStage(organizationId, 'PRESENTATION');
    }
    
    return json(qualification, { status: 200 });
  } catch (error) {
    console.error('Error updating qualification:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update qualification' },
      { status: 500 }
    );
  }
};

// GET: Retrieve qualification information
export const GET: RequestHandler = async ({ params }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const qualification = await prisma.qualification.findFirst({
      where: {
        organization: {
          organizationId
        }
      },
      include: {
        followups: true // Include followups in the response
      }
    });
    
    if (!qualification) {
      return json({ message: 'No qualification found for this organization' }, { status: 404 });
    }
    
    return json(qualification, { status: 200 });
  } catch (error) {
    console.error('Error retrieving qualification:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve qualification information' },
      { status: 500 }
    );
  }
};