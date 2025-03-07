// src/routes/api/sales/negotiation/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    const negotiationData = {
      followUp: {
        ...data.followUp,
        date: data.followUp.date ? new Date(data.followUp.date) : null
      }
    };

    // First try to find an existing negotiation
    const existingNegotiation = await prisma.negotiation.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });

    let negotiation;
    if (existingNegotiation) {
      // Update existing negotiation
      negotiation = await prisma.negotiation.update({
        where: {
          id: existingNegotiation.id
        },
        data: negotiationData
      });
    } else {
      // Create new negotiation
      negotiation = await prisma.negotiation.create({
        data: {
          ...negotiationData,
          organization: {
            connect: {
              organizationId
            }
          }
        }
      });
    }

    // Update organization's sales stage
    await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        salesStage: 'NEGOTIATION'
      }
    });

    return json(negotiation, { status: 200 });
  } catch (error) {
    console.error('Error saving negotiation data:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to save negotiation data' },
      { status: 500 }
    );
  }
};