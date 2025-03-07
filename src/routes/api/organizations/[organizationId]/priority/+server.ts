// src/routes/api/organizations/[organizationId]/priority/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db as prisma } from '$lib/database';
import { error } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
    // Check authentication
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const organizationId = params.organizationId;

    if (!organizationId) {
        throw error(400, 'Organization ID is required');
    }

    try {
        const body = await request.json();
        const { priority } = body;

        // Validate priority value
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
        if (!validPriorities.includes(priority)) {
            throw error(400, 'Invalid priority value. Must be LOW, MEDIUM, or HIGH');
        }

        // Check if organization exists and get its current assignment
        const organization = await prisma.organization.findUnique({
            where: { organizationId },
            include: { assignedTo: true }
        });

        if (!organization) {
            throw error(404, 'Organization not found');
        }

        // Optional: Check if user has permission to update this organization
        // For example, only assigned user or admin can update
        const isAssigned = organization.assignedTo?.id === locals.user.id;
        const isAdmin = locals.user.role === 'ADMIN'; // Assuming roleId 1 is admin

        if (!isAssigned && !isAdmin) {
            throw error(403, 'You do not have permission to update this organization');
        }

        // Update the organization priority
        const updatedOrganization = await prisma.organization.update({
            where: { organizationId },
            data: { priority },
            include: {
                contacts: true,
                assignedTo: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        // Return the updated organization data
        return json({
            success: true,
            data: updatedOrganization
        }, { status: 200 });

    } catch (err) {
        console.error('Error updating organization priority:', err);
        
        // Check if it's a known error type
        if (err instanceof Error) {
            const status = err instanceof error ? err.status : 500;
            return json({
                success: false,
                error: err.message || 'Failed to update organization priority'
            }, { status });
        }

        // Generic error response
        return json({
            success: false,
            error: 'An unexpected error occurred'
        }, { status: 500 });
    }
};