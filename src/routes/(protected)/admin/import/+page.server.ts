// src/routes/admin/import/+page.server.ts
import type { Actions } from './$types';
import { db as prisma } from '$lib/database';
import { fail } from '@sveltejs/kit';

export const actions = {
  manualImport: async ({ request }) => {
    const data = await request.formData();

    // Extract organization data
    const organizationName = data.get('organizationName')?.toString();
    const organizationAddress = data.get('organizationAddress')?.toString();
    const organizationWebsite = data.get('organizationWebsite')?.toString();

    // Extract contact data
    const contactName = data.get('contactName')?.toString();
    const contactDesignation = data.get('contactDesignation')?.toString();
    const contactMobile = data.get('contactMobile')?.toString();
    const contactDepartment = data.get('contactDepartment')?.toString();
    const contactEmail = data.get('contactEmail')?.toString();

    // Validate required fields
    if (!organizationName || !organizationAddress || 
        !contactName || !contactDesignation || 
        !contactMobile || !contactDepartment || !contactEmail) {
      return fail(400, { message: 'All fields are required' });
    }

    try {
      // Create organization with contact
      const organization = await prisma.organization.create({
        data: {
          name: organizationName,
          address: organizationAddress,
          website: organizationWebsite || '',
          contacts: {
            create: {
              name: contactName,
              designation: contactDesignation,
              mobile: contactMobile,
              department: contactDepartment,
              email: contactEmail
            }
          }
        }
      });

      return { success: true, organizationId: organization.organizationId };
    } catch (error) {
      console.error('Error importing prospect:', error);
      return fail(500, { message: 'Failed to import prospect' });
    }
  },
  bulkImport: async ({ request }) => {
    const data = await request.formData();
    const prospectData = data.get('prospects')?.toString();

    if (!prospectData) {
      return fail(400, { message: 'No prospect data provided' });
    }

    try {
      // Parse the prospect data
      const prospects = JSON.parse(prospectData);

      // Validate input
      if (!Array.isArray(prospects) || prospects.length === 0) {
        return fail(400, { message: 'Invalid prospect data' });
      }

      // Perform bulk import
      const importResults = await Promise.all(
        prospects.map(async (prospect) => {
          try {
            return await prisma.organization.create({
              data: {
                name: prospect.organizationName,
                address: prospect.organizationAddress,
                website: prospect.organizationWebsite || '',
                contacts: {
                  create: {
                    name: prospect.contactName,
                    designation: prospect.contactDesignation,
                    mobile: prospect.contactMobile,
                    department: prospect.contactDepartment,
                    email: prospect.contactEmail
                  }
                }
              }
            });
          } catch (error) {
            console.error(`Failed to import prospect: ${prospect.organizationName}`, error);
            return null;
          }
        })
      );

      // Filter out failed imports
      const successfulImports = importResults.filter(result => result !== null);

      return { 
        success: true, 
        importedCount: successfulImports.length,
        totalAttempted: prospects.length
      };
    } catch (error) {
      console.error('Bulk import error:', error);
      return fail(500, { message: 'Failed to process bulk import' });
    }
  }
} satisfies Actions;