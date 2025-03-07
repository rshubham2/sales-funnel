// src/routes/api/sales/followup/[followupId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';
import { error } from '@sveltejs/kit';

// DELETE handler to remove followup
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { followupId } = params;
    
    if (!followupId) {
      throw error(400, 'Followup ID is required');
    }
    
    // Check if followup exists
    const followup = await prisma.presentationFollowup.findUnique({
      where: { id: followupId }
    });
    
    if (!followup) {
      throw error(404, 'Followup not found');
    }
    
    // Delete followup
    await prisma.presentationFollowup.delete({
      where: { id: followupId }
    });
    
    return json({ message: 'Followup deleted successfully' });
  } catch (err) {
    console.error('Error deleting followup:', err);
    throw error(500, 'Failed to delete followup');
  }
};