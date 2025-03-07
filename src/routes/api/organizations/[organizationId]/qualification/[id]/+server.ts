// src/routes/api/organizations/[organizationId]/qualification/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// GET: Fetch a specific qualification
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    const qualification = await prisma.qualification.findUnique({
      where: { id },
      include: {
        followups: true
      }
    });
    
    if (!qualification) {
      return json({ message: 'Qualification record not found' }, { status: 404 });
    }
    
    return json(qualification);
  } catch (error) {
    console.error('Error fetching qualification:', error);
    return json({ message: 'Failed to fetch qualification record', error: error.message }, { status: 500 });
  }
};

// PUT: Update a qualification
// PUT: Update a qualification
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id, organizationId } = params;
    const data = await request.json();
    
    // First get the existing followups to handle deletions
    const existingQualification = await prisma.qualification.findUnique({
      where: { id },
      include: { followups: true }
    });
    
    if (!existingQualification) {
      return json({ message: 'Qualification record not found' }, { status: 404 });
    }
    
    // Get the IDs of existing followups
    const existingFollowupIds = existingQualification.followups.map(f => f.id);
    // Get the IDs of followups in the update request
    const updatedFollowupIds = data.followups
      .filter(f => f.id)
      .map(f => f.id);
    
    // Find followups to delete (those in existing but not in updated)
    const followupsToDelete = existingFollowupIds.filter(
      id => !updatedFollowupIds.includes(id)
    );
    
    // Delete the followups that are no longer present
    if (followupsToDelete.length > 0) {
      await prisma.qualificationFollowup.deleteMany({
        where: {
          id: { in: followupsToDelete }
        }
      });
    }
    
    // Update the qualification with new data
    const qualification = await prisma.qualification.update({
      where: { id },
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
        dropReason: data.dropReason || null,
      }
    });

    console.log("id",data);
    
    // Handle followups - update existing ones and create new ones
    for (const followup of data.followups) {
      if (followup.id) {
        // Update existing followup
        await prisma.qualificationFollowup.update({
          where: { id: followup.id },
          data: {
            remark: followup.remark,
            followupDate: new Date(followup.followupDate)
          }
        });
      } else {
        // Create new followup
        await prisma.qualificationFollowup.create({
          data: {
            qualificationId: id,
            remark: followup.remark,
            followupDate: new Date(followup.followupDate)
          }
        });
      }
    }
    
    // Update the organization's sales stage based on status change
    if (data.status !== existingQualification.status) {
      if (data.status === 'MOVED_TO_NEXT') {
        await prisma.organization.update({
          where: { organizationId },
          data: { salesStage: 'PRESENTATION' }
        });
      } else if (data.status === 'DROPPED') {
        await prisma.organization.update({
          where: { organizationId },
          data: { salesStage: 'CLOSED_LOST' }
        });
      }
    }
    
    // Fetch the updated qualification with all followups to ensure they're included in the response
    const updatedQualification = await prisma.qualification.findUnique({
      where: { id },
      include: {
        followups: true
      }
    });
    
    return json(updatedQualification);
  } catch (error) {
    console.error('Error updating qualification:', error);
    return json({ message: 'Failed to update qualification record', error: error.message }, { status: 500 });
  }
};

// DELETE: Delete a qualification
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    // First delete all associated followups
    await prisma.qualificationFollowup.deleteMany({
      where: {
        qualificationId: id
      }
    });
    
    // Then delete the qualification
    await prisma.qualification.delete({
      where: { id }
    });
    
    return json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    console.error('Error deleting qualification:', error);
    return json({ message: 'Failed to delete qualification record', error: error.message }, { status: 500 });
  }
};