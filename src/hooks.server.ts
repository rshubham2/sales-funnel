// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/database';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  // If no session, protect all routes except login/register
  if (!session && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/register')) {
    throw redirect(303, '/login');
  }

  if (session) {
    const user = await db.user.findUnique({
      where: { userAuthToken: session },
      select: { 
        id: true, 
        username: true, 
        role: true, 
        email: true, 
        status: true,
        assignedOrganizations: {
          select: {
            organizationId: true,
            name: true,
            salesStage: true
          }
        }
      }
    });

    if (user) {
      // Set user data in locals
      event.locals.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role.name,
        assignedOrganizations: user.assignedOrganizations
      };

      // Protect admin routes
      if (event.url.pathname.startsWith('/admin') && user.role.name !== 'ADMIN') {
        throw redirect(303, '/');
      }

      // Protect sales pipeline routes
      if (event.url.pathname.startsWith('/sales/pipeline')) {
        const organizationId = event.params.orgId;
        
        // Check if user has access to this organization
        if (organizationId) {
          const hasAccess = user.assignedOrganizations.some(
            org => org.organizationId === organizationId
          );

          if (!hasAccess && user.role.name !== 'ADMIN') {
            throw redirect(303, '/sales/organizations');
          }
        }
      }
    }
  }

  return await resolve(event);
};