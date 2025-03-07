// src/routes/api/sales/proposal/[organizationId]/+server.ts
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
    
    const proposalData = {
      submissionDate: new Date(data.submissionDate),
      value: parseFloat(data.value)
    };

    // First try to find an existing proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });

    let proposal;
    if (existingProposal) {
      // Update existing proposal
      proposal = await prisma.proposal.update({
        where: {
          id: existingProposal.id
        },
        data: proposalData
      });
    } else {
      // Create new proposal
      proposal = await prisma.proposal.create({
        data: {
          ...proposalData,
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
        salesStage: 'PROPOSAL'
      }
    });

    return json(proposal, { status: 200 });
  } catch (error) {
    console.error('Error saving proposal data:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to save proposal data' },
      { status: 500 }
    );
  }
};