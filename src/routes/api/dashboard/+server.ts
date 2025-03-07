// src/routes/api/dashboard/+server.ts
import { error, json } from '@sveltejs/kit';
import {db as prisma} from '$lib/database';

export async function GET() {
  try {
    const [organizations, users, orders] = await Promise.all([
      prisma.organization.findMany({
        include: {
          leads: true,
          qualification: true,
          presentation: true,
          POC: true,
          proposal: true,
          negotiation: true,
          order: true,
        }
      }),
      prisma.user.findMany({
        include: {
          assignedOrganizations: true
        }
      }),
      prisma.order.findMany({
        where: {
          projectStatus: 'COMPLETED'
        }
      })
    ]);

    return json({
      organizations,
      users,
      orders,
      success: true
    });
  } catch (error) {
    return json({
      error: 'Failed to fetch dashboard data',
      success: false
    }, { status: 500 });
  }
}