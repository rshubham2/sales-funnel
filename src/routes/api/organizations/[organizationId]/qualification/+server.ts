// src/routes/api/organizations/[organizationId]/qualification/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// POST: Create a new qualification record
// POST: Create a new qualification record
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { organizationId } = params;
    const data = await request.json();
   
    // Transform the data to match the database schema
    const qualificationData = {
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
      followups: data.followups,
      stageEntryDate: new Date() // Ensure stageEntryDate is set
    };
   
    // Create the qualification record
    const qualification = await prisma.qualification.create({
      data: {
        ...qualificationData,
        organization: {
          connect: {
            organizationId
          }
        },
        followups: {
          create: data.followups.map((followup) => ({
            remark: followup.remark,
            followupDate: new Date(followup.followupDate)
          }))
        }
      },
      include: {
        followups: true
      }
    });
   
    // Update the organization's sales stage based on qualification status
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
   
    return json(qualification);
  } catch (error) {
    console.error('Error creating qualification:', error);
    return json({ message: 'Failed to create qualification record', error: error.message }, { status: 500 });
  }
};

// GET: List all qualifications for an organization
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { organizationId } = params;
   
    const qualifications = await prisma.qualification.findMany({
      where: {
        organization: {
          organizationId
        }
      },
      include: {
        followups: true
      },
      orderBy: {
        stageEntryDate: 'desc'
      }
    });
   
    return json(qualifications);
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return json({ message: 'Failed to fetch qualification records', error: error.message }, { status: 500 });
  }
};