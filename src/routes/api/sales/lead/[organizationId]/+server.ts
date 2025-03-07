// src/routes/api/sales/lead/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';

// POST: Create new lead
export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Create a new lead
    const lead = await prisma.leads.create({
      data: {
        vertical: data.vertical,
        totalLocations: Number(data.totalLocations),
        businessExpectationsCount: Number(data.businessExpectationsCount),
        businessExpectationsValue: Number(data.businessExpectationsValue),
        businessExpectationsMRR: Number(data.businessExpectationsMRR),
        category: data.category,
        organization: {
          connect: {
            organizationId
          }
        }
      }
    });
    
    // Update organization sales stage and priority
    await prisma.organization.update({
      where: {
        organizationId
      },
      data: {
        salesStage: 'QUALIFICATION',
        priority: data.category === 'High Priority' ? 'HIGH' : data.category === 'Medium Priority' ? 'MEDIUM' : 'LOW'
      }
    });
    
    return json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to create lead' },
      { status: 500 }
    );
  }
};

// PUT: Update existing lead
export const PUT: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const data = await request.json();
    
    // Find the existing lead for this organization
    const existingLead = await prisma.leads.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!existingLead) {
      return json({ error: 'Lead not found for this organization' }, { status: 404 });
    }
    
    // Update the lead
    const lead = await prisma.leads.update({
      where: {
        id: existingLead.id
      },
      data: {
        vertical: data.vertical,
        totalLocations: Number(data.totalLocations),
        businessExpectationsCount: Number(data.businessExpectationsCount),
        businessExpectationsValue: Number(data.businessExpectationsValue),
        businessExpectationsMRR: Number(data.businessExpectationsMRR),
        category: data.category
      }
    });
    
    // Also update the organization's priority if it's included in the request
    if (data.category) {
      await prisma.organization.update({
        where: {
          organizationId
        },
        data: {
          priority: data.category === 'High Priority' ? 'HIGH' : data.category === 'Medium Priority' ? 'MEDIUM' : 'LOW'
        }
      });
    }
    
    return json(lead, { status: 200 });
  } catch (error) {
    console.error('Error updating lead:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to update lead' },
      { status: 500 }
    );
  }
};

// GET: Retrieve lead information
export const GET: RequestHandler = async ({ params }) => {
  const { organizationId } = params;
  
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    // Find lead for this organization
    const lead = await prisma.leads.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });
    
    if (!lead) {
      return json({ message: 'No lead found for this organization' }, { status: 404 });
    }
    
    return json(lead, { status: 200 });
  } catch (error) {
    console.error('Error retrieving lead:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve lead information' },
      { status: 500 }
    );
  }
};