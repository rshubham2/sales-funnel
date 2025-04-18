// src/routes/api/organizations/[organizationId]/assign/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database';
import { SalesStage } from '@prisma/client';

export const POST: RequestHandler = async ({ params, request, locals }) => {
    // Authentication check remains the same
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { userId } = await request.json();

        // Verify the organization exists
        const organization = await db.organization.findUnique({
            where: { organizationId: params.organizationId },
            select: { assignedToId: true, salesStage: true }
        });

        if (!organization) {
            return new Response('Organization not found', { status: 404 });
        }

        // Check if organization is already assigned
        if (organization.assignedToId) {
            return new Response('Organization is already assigned', { status: 400 });
        }

        // Update the organization with the new assignment - explicitly use the enum type
        const updatedOrganization = await db.organization.update({
            where: { organizationId: params.organizationId },
            data: {
                salesStage: SalesStage.LEAD,
                assignedToId: userId,
                
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        console.log("Updated organization:", updatedOrganization); // Add logging to verify

        return json({
            success: true,
            organization: updatedOrganization
        });

    } catch (error) {
        console.error('Error assigning organization:', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
};

// Optional: Add GET endpoint to check assignment status
export const GET: RequestHandler = async ({ params, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const organization = await db.organization.findUnique({
            where: { organizationId: params.organizationId },
            select: {
                assignedToId: true,
                assignedTo: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        if (!organization) {
            return new Response('Organization not found', { status: 404 });
        }

        return json({
            success: true,
            assignment: organization
        });

    } catch (error) {
        console.error('Error checking assignment:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};