// src/routes/api/organizations/[organizationId]/current-qualification/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

// GET: Fetch the most recent qualification for an organization
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { organizationId } = params;
   
    // Find the most recent qualification for this organization
    const qualification = await prisma.qualification.findMany({
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
   
    if (!qualification) {
      return json(null);
    }
   
    return json(qualification);
  } catch (error) {
    console.error('Error fetching current qualification:', error);
    return json({ message: 'Failed to fetch current qualification', error: error.message }, { status: 500 });
  }
};