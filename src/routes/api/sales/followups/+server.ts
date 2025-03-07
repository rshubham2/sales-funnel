// src/routes/api/sales/followup/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';
import { error } from '@sveltejs/kit';

// POST handler to create a new followup
export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { presentationId, remark, followupDate } = data;
    
    if (!presentationId || !remark || !followupDate) {
      throw error(400, 'Presentation ID, remark and followup date are required');
    }
    
    // Check if presentation exists
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId }
    });
    
    if (!presentation) {
      throw error(404, 'Presentation not found');
    }
    
    // Create followup
    const followup = await prisma.presentationFollowup.create({
      data: {
        remark,
        followupDate: new Date(followupDate),
        presentation: {
          connect: { id: presentationId }
        }
      }
    });
    
    return json(followup);
  } catch (err) {
    console.error('Error creating followup:', err);
    throw error(500, 'Failed to create followup');
  }
};