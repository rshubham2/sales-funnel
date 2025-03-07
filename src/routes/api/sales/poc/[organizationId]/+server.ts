// src/routes/api/sales/poc/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

// POST: Create or update POC information for an organization
export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
 
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
 
  try {
    const data = await request.json();
    
    // Check if POC entry already exists for this organization
    const existingPOC = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    let poc;
    
    if (existingPOC) {
      // Update existing POC
      poc = await prisma.pOC.update({
        where: {
          id: existingPOC.id
        },
        data: {
          totalSites: data.totalSites,
          productDetail: data.productDetail,
          POCDuration: data.POCDuration,
          POCType: data.POCType,
          businessSites: data.businessSites,
          businessValue: data.businessValue,
          MRR: data.MRR,
          hardwareSites: data.hardwareSites,
          avgHardwareValue: data.avgHardwareValue,
          hardwareValue: data.hardwareValue,
          POCStatus: data.POCStatus,
          followUp: data.followUp
        }
      });
    } else {
      // Create new POC
      poc = await prisma.pOC.create({
        data: {
          totalSites: data.totalSites,
          productDetail: data.productDetail,
          POCDuration: data.POCDuration,
          POCType: data.POCType,
          businessSites: data.businessSites,
          businessValue: data.businessValue,
          MRR: data.MRR,
          hardwareSites: data.hardwareSites,
          avgHardwareValue: data.avgHardwareValue,
          hardwareValue: data.hardwareValue,
          POCStatus: data.POCStatus,
          followUp: data.followUp,
          organization: {
            connect: {
              organizationId
            }
          }
        }
      });
    }
    
    // Update organization's sales stage if necessary
    if (data.updateStage) {
      await prisma.organization.update({
        where: {
          organizationId
        },
        data: {
          salesStage: 'POC'
        }
      });
    }
    
    return json(poc, { status: 200 });
  } catch (error) {
    console.error('Error saving POC information:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to save POC information' },
      { status: 500 }
    );
  }
};

// GET: Retrieve POC information for an organization
export const GET: RequestHandler = async ({ params }) => {
  const { organizationId } = params;

  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }

  try {
    const poc = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });

    if (!poc) {
      return json({ message: 'No POC information found' }, { status: 404 });
    }

    return json(poc, { status: 200 });
  } catch (error) {
    console.error('Error retrieving POC information:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve POC information' },
      { status: 500 }
    );
  }
};