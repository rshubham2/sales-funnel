// src/routes/(protected)/admin/dashboard/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db as prisma } from '$lib/database';

export const load: PageServerLoad = async () => {
  try {
    const [
      organizationCount,
      salesStageDistribution,
      orders,
      pocStats,
      userPerformance,
      // New queries for vertical analysis
      verticalDistribution,
      opportunityCount,
      closedWonCount
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

      // User performance with more detailed metrics
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          assignedOrganizations: {
            select: {
              salesStage: true,
              organizationId: true,
              order: {
                select: {
                  finalOrderValue: true,
                  projectStatus: true
                }
              },
              leads: {
                select: {
                  vertical: true,
                  businessExpectationsValue: true
                }
              }
            }
          }
        }
      }),
      
      // Get distribution by vertical
      prisma.leads.groupBy({
        by: ['vertical'],
        _count: true,
        _sum: {
          businessExpectationsValue: true
        },
      }),

      // Count all opportunities (for win rate calculation)
      prisma.organization.count({
        where: {
          salesStage: {
            in: ['PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST']
          }
        }
      }),

      // Count closed won deals (for win rate calculation)
      prisma.organization.count({
        where: {
          salesStage: 'CLOSED_WON'
        }
      })
    ]);

    // Calculate enhanced user metrics
    const userMetrics = userPerformance.map(user => {
      const organizations = user.assignedOrganizations;
      
      // Count organizations by status for each user
      const closedWonCount = organizations.filter(org => 
        org.salesStage === 'CLOSED_WON'
      ).length;
      
      const closedLostCount = organizations.filter(org => 
        org.salesStage === 'CLOSED_LOST'
      ).length;
      
      const inProgressCount = organizations.filter(org => 
        !['CLOSED_WON', 'CLOSED_LOST'].includes(org.salesStage)
      ).length;

      // Calculate revenue
      const revenue = organizations.reduce((sum, org) => {
        const orderValue = org.order?.reduce((total, o) => 
          total + (o.finalOrderValue || 0), 0) || 0;
        return sum + orderValue;
      }, 0);

      // Count total deals
      const totalDeals = organizations.length;
      
      // Calculate win rate
      const totalOpportunities = closedWonCount + closedLostCount;
      const winRate = totalOpportunities > 0 
        ? (closedWonCount / totalOpportunities) * 100 
        : 0;
      
      // Calculate average deal size
      const avgDealSize = closedWonCount > 0 ? revenue / closedWonCount : 0;

      return {
        username: user.username,
        totalDeals,
        wonDeals: closedWonCount,
        lostDeals: closedLostCount,
        inProgressDeals: inProgressCount,
        closedWonCount,
        closedLostCount,
        inProgressCount,
        revenue,
        winRate,
        avgDealSize
      };
    });

    // Format vertical data
    const verticalData = verticalDistribution.map(item => ({
      vertical: item.vertical,
      count: item._count,
      revenue: item._sum.businessExpectationsValue || 0
    }));

    // Calculate top verticals
    const topVerticals = [...verticalData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(v => ({
        name: v.vertical,
        deals: v.count,
        revenue: v.revenue,
        // Example calculation for conversion rate - adjust based on your business logic
        conversionRate: Math.round(Math.random() * 30 + 45) // Replace with actual calculation
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
      userMetrics,
      // New data properties
      verticalData,
      topVerticals,
      opportunityCount,
      closedWonCount
    };
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    throw error(500, 'Failed to load dashboard data');
  }
};