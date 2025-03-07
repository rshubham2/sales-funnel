// src/routes/api/sales/file-upload/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';
import { error } from '@sveltejs/kit';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Function to save file to disk
const saveFileToDisk = async (file: File, presentationId: string): Promise<string> => {
  try {
    // Get current file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(__dirname, '../../../../../static/uploads');
    mkdirSync(uploadsDir, { recursive: true });
    
    // Create unique filename
    const uniqueFilename = `${presentationId}-${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, uniqueFilename);
    
    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filePath, buffer);
    
    // Return public URL
    return `/uploads/${uniqueFilename}`;
  } catch (err) {
    console.error('Error saving file:', err);
    throw new Error('Failed to save file');
  }
};

// POST handler for file upload
export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const presentationId = formData.get('presentationId') as string;
    const organizationId = formData.get('organizationId') as string;
    
    if (!file) {
      throw error(400, 'No file provided');
    }
    
    if (!presentationId || presentationId === 'new') {
      if (!organizationId) {
        throw error(400, 'Organization ID is required for new presentations');
      }
      
      // Create new presentation if it doesn't exist
      const presentation = await prisma.presentation.create({
        data: {
          status: 'IN_PROGRESS',
          isQualified: 'no',
          decisionMakerInvolved: 'no',
          formalProposalRequested: 'no',
          budgetApproved: 'no',
          caseClosureTimeFrame: '',
          isPOC: 'no',
          organization: {
            connect: { organizationId }
          }
        }
      });
      
      // Set presentationId to newly created presentation
      const newPresentationId = presentation.id;
      
      // Save file to disk
      const fileUrl = await saveFileToDisk(file, newPresentationId);
      
      // Create file record in database
      const presentationFile = await prisma.presentationFile.create({
        data: {
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          presentation: {
            connect: { id: newPresentationId }
          }
        }
      });
      
      return json({ 
        message: 'File uploaded successfully',
        file: presentationFile
      });
    } else {
      // Check if presentation exists
      const presentation = await prisma.presentation.findUnique({
        where: { id: presentationId }
      });
      
      if (!presentation) {
        throw error(404, 'Presentation not found');
      }
      
      // Save file to disk
      const fileUrl = await saveFileToDisk(file, presentationId);
      
      // Create file record in database
      const presentationFile = await prisma.presentationFile.create({
        data: {
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          presentation: {
            connect: { id: presentationId }
          }
        }
      });
      
      return json({ 
        message: 'File uploaded successfully',
        file: presentationFile
      });
    }
  } catch (err) {
    console.error('Error uploading file:', err);
    throw error(500, 'Failed to upload file');
  }
};