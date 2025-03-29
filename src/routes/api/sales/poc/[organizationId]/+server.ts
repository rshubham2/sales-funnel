// src/routes/api/sales/poc/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

// POST: Create new POC
export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Create a new POC record
    const poc = await prisma.pOC.create({
      data: {
        totalSites: Number(data.totalSites),
        productDetail: data.productDetail,
        POCDuration: data.POCDuration,
        POCType: data.POCType,
        businessSites: Number(data.businessSites),
        businessValue: Number(data.businessValue),
        MRR: Number(data.MRR),
        hardwareSites: Number(data.hardwareSites),
        avgHardwareValue: Number(data.avgHardwareValue),
        hardwareValue: Number(data.hardwareValue),
        POCStatus: data.POCStatus,
        dropReason: data.dropReason || null,
        lossReason: data.lossReason || null,
        organization: {
          connect: {
            organizationId
          }
        }
      }
    });
    

    
    return json(poc, { status: 201 });
  } catch (error) {
    console.error('Error creating POC:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create POC' },
      { status: 500 }
    );
  }
};

// PUT: Update existing POC
export const PUT: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Find the existing POC for this organization
    const existingPOC = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!existingPOC) {
      return json({ error: 'POC not found for this organization' }, { status: 404 });
    }
    
    // Update the POC
    const poc = await prisma.pOC.update({
      where: {
        id: existingPOC.id
      },
      data: {
        totalSites: Number(data.totalSites),
        productDetail: data.productDetail,
        POCDuration: data.POCDuration,
        POCType: data.POCType,
        businessSites: Number(data.businessSites),
        businessValue: Number(data.businessValue),
        MRR: Number(data.MRR),
        hardwareSites: Number(data.hardwareSites),
        avgHardwareValue: Number(data.avgHardwareValue),
        hardwareValue: Number(data.hardwareValue),
        POCStatus: data.POCStatus,
        dropReason: data.dropReason || null,
        lossReason: data.lossReason || null
      }
    });
    

    
    return json(poc, { status: 200 });
  } catch (error) {
    console.error('Error updating POC:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update POC' },
      { status: 500 }
    );
  }
};

// GET: Retrieve POC information
export const GET: RequestHandler = async ({ params }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    // Find POC for this organization
    const poc = await prisma.pOC.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!poc) {
      return json({ message: 'No POC found for this organization' }, { status: 404 });
    }
    
    return json(poc, { status: 200 });
  } catch (error) {
    console.error('Error retrieving POC:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve POC information' },
      { status: 500 }
    );
  }
};