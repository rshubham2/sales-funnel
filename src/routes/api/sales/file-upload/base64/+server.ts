// Create a new API endpoint for Base64 file uploads
// src/routes/api/sales/file-upload/base64/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { 
      base64Data, 
      fileName, 
      fileType, 
      presentationId, 
      organizationId 
    } = await request.json();
    
    if (!base64Data || !fileName || !presentationId) {
      throw error(400, 'Missing required fields');
    }
    
    // If presentationId is 'new', we need to create a presentation first
    let actualPresentationId = presentationId;
    
    if (presentationId === 'new' && organizationId) {
      const newPresentation = await prisma.presentation.create({
        data: {
          organization: {
            connect: { organizationId }
          },
          status: 'IN_PROGRESS'
        }
      });
      actualPresentationId = newPresentation.id;
    }
    
    // Store file information
    const file = await prisma.presentationFile.create({
      data: {
        fileName,
        fileType,
        fileUrl: base64Data, // Store the actual base64 data
        presentation: {
          connect: { id: actualPresentationId }
        }
      }
    });
    
    return json({ 
      success: true, 
      file: {
        ...file,
        // Don't send back the full base64 data to avoid large response
        fileUrl: `data:${fileType};base64,[base64-data]`
      },
      presentationId: actualPresentationId
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    throw error(500, 'Failed to upload file');
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const fileId = url.searchParams.get('id');
    
    if (!fileId) {
      throw error(400, 'File ID is required');
    }
    
    await prisma.presentationFile.delete({
      where: { id: fileId }
    });
    
    return json({ success: true });
  } catch (err) {
    console.error('Error deleting file:', err);
    throw error(500, 'Failed to delete file');
  }
};