// src/routes/api/sales/order/[organizationId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';

export const POST: RequestHandler = async ({ params, request }) => {
  const { organizationId } = params;
 
  if (!organizationId) {
    return json({ error: 'Organization ID is required' }, { status: 400 });
  }
 
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Validate required fields
    if (!data.projectStatus) {
      return json({ error: 'Project status is required' }, { status: 400 });
    }

    if (data.projectStatus === 'CLOSED_LOST' && !data.lossReason) {
      return json({ error: 'Loss reason is required for closed lost status' }, { status: 400 });
    }

    // Convert and validate numeric fields
    const orderData = {
      projectStatus: data.projectStatus,
      finalOrderValue: data.finalOrderValue ? parseFloat(data.finalOrderValue) : null,
      finalBusinessValue: data.finalBusinessValue || null,
      totalHardwareSites: data.totalHardwareSites ? parseInt(data.totalHardwareSites) : null,
      avgHardwareValue: data.avgHardwareValue ? parseFloat(data.avgHardwareValue) : null,
      totalHardwareValue: data.totalHardwareValue ? parseFloat(data.totalHardwareValue) : null,
      lossReason: data.lossReason || null
    };

    let order;
    
    // Check if order exists for the organization
    const existingOrder = await prisma.order.findFirst({
      where: {
        organization: {
          organizationId
        }
      }
    });

    if (existingOrder) {
      // Update existing order
      order = await prisma.order.update({
        where: {
          id: existingOrder.id
        },
        data: orderData
      });
    } else {
      // Create new order
      order = await prisma.order.create({
        data: {
          ...orderData,
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
      where: { organizationId },
      data: { salesStage: data.projectStatus }
    });

    return json(order);

  } catch (error) {
    console.error('Error saving order data:', error);
    
    // Check if it's a Prisma error
    if ('code' in error) {
      return json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    return json({ 
      error: error instanceof Error ? error.message : 'Failed to save order data' 
    }, { status: 500 });
  }
};