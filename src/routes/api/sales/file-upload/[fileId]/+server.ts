// src/routes/api/sales/file-upload/[fileId]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';
import { error } from '@sveltejs/kit';
import { unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// DELETE handler to remove file
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      throw error(400, 'File ID is required');
    }
    
    // Get file information
    const file = await prisma.presentationFile.findUnique({
      where: { id: fileId }
    });
    
    if (!file) {
      throw error(404, 'File not found');
    }
    
    // Get current file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    try {
      // Extract filename from fileUrl
      const fileName = file.fileUrl.split('/').pop();
      if (fileName) {
        const filePath = join(__dirname, '../../../../../../static/uploads', fileName);
        
        // Delete file from disk
        unlinkSync(filePath);
      }
    } catch (fileErr) {
      // Log but continue if file not found on disk
      console.warn('File not found on disk:', fileErr);
    }
    
    // Delete file record from database
    await prisma.presentationFile.delete({
      where: { id: fileId }
    });
    
    return json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting file:', err);
    throw error(500, 'Failed to delete file');
  }
};