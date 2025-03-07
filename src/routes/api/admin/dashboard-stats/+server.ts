// src/routes/api/analytics/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {db as prisma} from '$lib/database';

export const GET: RequestHandler = async () => {
  try {
    const [
      organizationCount,
      salesStageDistribution,
      priorityDistribution,
      tags,
      pocStats,
      orderStats
    ] = await Promise.all([
      // Total organizations
      prisma.organization.count(),
      
      // Sales stage distribution
      prisma.organization.groupBy({
        by: ['salesStage'],
        _count: true
      }),
      
      // Priority distribution
      prisma.organization.groupBy({
        by: ['priority'],
        _count: true
      }),
      
      // Tags analysis
      prisma.organization.findMany({
        select: { tags: true }
      }),
      
      // POC stats
      prisma.pOC.aggregate({
        _avg: {
          businessValue: true,
          MRR: true
        },
        _count: true
      }),
      
      // Order stats
      prisma.order.aggregate({
        _avg: {
          finalOrderValue: true
        },
        where: {
          projectStatus: {
            in: ['CLOSED_WON', 'CLOSED_LOST']
          }
        }
      })
    ]);

    return json({
      organizationCount,
      salesStageDistribution,
      priorityDistribution,
      tags,
      pocStats,
      orderStats
    });
  } catch (error) {
    return json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
};