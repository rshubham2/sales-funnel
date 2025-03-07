// src/routes/(protected)/admin/dashboard/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {db as prisma} from '$lib/database';

export const load: PageServerLoad = async () => {
  try {
    const [
      organizationCount,
      salesStageDistribution,
      orders,
      pocStats,
      userPerformance
    ] = await Promise.all([
      // Total organizations
      prisma.organization.count(),
      
      // Sales stage distribution
      prisma.organization.groupBy({
        by: ['salesStage'],
        _count: true
      }),
      
      // Orders for revenue calculations
      prisma.order.findMany({
        where: {
          projectStatus: 'CLOSED_WON'
        },
        select: {
          finalOrderValue: true,
          finalBusinessValue: true
        }
      }),

      // POC stats
      prisma.pOC.aggregate({
        _avg: {
          businessValue: true,
          MRR: true
        },
        _count: true
      }),

      prisma.user.findMany({
        select: {
          username: true,
          assignedOrganizations: {
            select: {
              salesStage: true,
              order: {
                select: {
                  finalOrderValue: true,
                  projectStatus: true
                }
              }
            }
          }
        }
      })
    ]);

    // Calculate user metrics
    const userMetrics = userPerformance.map(user => ({
      username: user.username,
      totalDeals: user.assignedOrganizations.length,
      wonDeals: user.assignedOrganizations.filter(org => 
        org.order?.some(o => o.projectStatus === 'CLOSED_WON')
      ).length,
      revenue: user.assignedOrganizations.reduce((sum, org) => {
        const orderValue = org.order?.reduce((total, o) => 
          total + (o.finalOrderValue || 0), 0) || 0;
        return sum + orderValue;
      }, 0),
      winRate: 0, // Calculate this based on your business logic
      avgDealSize: 0 // Calculate this based on your business logic
    }));

    const totalRevenue = orders.reduce((sum, order) => sum + (order.finalOrderValue || 0), 0);

    
    // Calculate average deal size
    const avgDealSize = orders.length > 0 ? totalRevenue / orders.length : 0;



    return {
      organizationCount,
      salesStageDistribution,
      totalRevenue,
      avgDealSize,
      monthlyRevenue: Array(6).fill(totalRevenue / 6), // Simplified monthly data
      pocStats: {
        avgBusinessValue: pocStats._avg.businessValue || 0,
        avgMRR: pocStats._avg.MRR || 0,
        count: pocStats._count || 0
      },
     userMetrics
    };
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    throw error(500, 'Failed to load dashboard data');
  }
};