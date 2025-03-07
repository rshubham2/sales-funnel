// src/routes/admin/import/+page.server.ts
import type { Actions } from './$types';
import { db as prisma } from '$lib/database';
import { fail } from '@sveltejs/kit';

export const actions = {
  manualImport: async ({ request }) => {
    const data = await request.formData();
    
    // Extract form data
    const organizationName = data.get('organizationName')?.toString();
    const organizationAddress = data.get('organizationAddress')?.toString();
    const organizationWebsite = data.get('organizationWebsite')?.toString();
    const contactName = data.get('contactName')?.toString();
    const contactDesignation = data.get('contactDesignation')?.toString();
    const contactMobile = data.get('contactMobile')?.toString();
    const contactDepartment = data.get('contactDepartment')?.toString();
    const contactEmail = data.get('contactEmail')?.toString();

    if (!organizationName || !organizationAddress || 
        !contactName || !contactDesignation || 
        !contactMobile || !contactDepartment || !contactEmail) {
      return fail(400, { message: 'All required fields must be filled' });
    }

    try {
      // Check for duplicate organization
      const existingOrg = await prisma.organization.findFirst({
        where: {
          AND: [
            { name: organizationName },
            { address: organizationAddress }
          ]
        }
      });

      if (existingOrg) {
        return fail(400, { 
          message: 'An organization with this name and address already exists' 
        });
      }

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

      return { success: true, organizationId: organization.id };
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
      const prospects = JSON.parse(prospectData);
      
      if (!Array.isArray(prospects) || prospects.length === 0) {
        return fail(400, { message: 'Invalid prospect data' });
      }

      const results = {
        success: [] as any[],
        duplicates: [] as string[],
        errors: [] as string[]
      };

      for (const prospect of prospects) {
        try {
          // Check for duplicate
          const existingOrg = await prisma.organization.findFirst({
            where: {
              AND: [
                { name: prospect.organizationName },
                { address: prospect.organizationAddress }
              ]
            }
          });

          if (existingOrg) {
            results.duplicates.push(prospect.organizationName);
            continue;
          }

          const org = await prisma.organization.create({
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

          results.success.push(org);
        } catch (error) {
          results.errors.push(prospect.organizationName);
        }
      }

      return {
        success: true,
        results: {
          imported: results.success.length,
          duplicates: results.duplicates.length,
          errors: results.errors.length,
          total: prospects.length
        }
      };
    } catch (error) {
      console.error('Bulk import error:', error);
      return fail(500, { message: 'Failed to process bulk import' });
    }
  }
} satisfies Actions;