// src/routes/api/sales/followup/[id]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';
import { error } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      throw error(400, 'Followup ID is required');
    }
    
    // Delete the followup
    await prisma.presentationFollowup.delete({
      where: { id }
    });
    
    return json({ success: true });
  } catch (err) {
    console.error('Error deleting followup:', err);
    throw error(500, 'Failed to delete followup');
  }
};