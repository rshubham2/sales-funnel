import type { PageServerLoad } from './$types';
import { db as prisma } from '$lib/database';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // Ensure user is authenticated and get user ID from locals
  if (!locals.user?.id) {
    throw error(401, 'Unauthorized');
  }

  const userId = locals.user.id;

  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      }
    });

    if (!user) {
      throw error(404, 'User not found');
    }

    // Get all organizations assigned to the user
    const organizations = await prisma.organization.findMany({
      where: {
        assignedToId: userId
      },
      include: {
        POC: true,
        proposal: true,
      }
    });

    // Calculate total pipeline value
    const pipelineValue = organizations.reduce((total, org) => {
      if (org.salesStage !== 'CLOSED_LOST' && org.proposal?.[0]?.value) {
        return total + org.proposal[0].value;
      }
      return total;
    }, 0);

    // Calculate stage distribution
    const stageDistribution = organizations.reduce((acc, org) => {
      acc[org.salesStage] = (acc[org.salesStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get monthly performance (deals closed)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const closedDeals = await prisma.organization.groupBy({
      by: ['lastContactDate'],
      where: {
        assignedToId: userId,
        salesStage: 'CLOSED_WON',
        lastContactDate: {
          gte: startOfYear
        }
      },
      _count: true,
    });

    // Format monthly performance data
    const formattedMonthlyPerformance = closedDeals.map(entry => ({
      month: entry.lastContactDate ? 
        new Date(entry.lastContactDate).toLocaleString('default', { month: 'short' }) : 
        'Unknown',
      dealsCount: entry._count
    }));

    // Calculate POC metrics
    const pocMetrics = organizations
      .filter(org => org.POC && org.POC.length > 0)
      .reduce((metrics, org) => {
        const poc = org.POC[0];
        return {
          avgMRR: metrics.avgMRR + (poc.MRR || 0),
          totalBusinessSites: metrics.totalBusinessSites + (poc.businessSites || 0),
          avgHardwareValue: metrics.avgHardwareValue + (poc.avgHardwareValue || 0),
          count: metrics.count + 1
        };
      }, { avgMRR: 0, totalBusinessSites: 0, avgHardwareValue: 0, count: 0 });

    // Calculate averages for POC metrics
    const finalPocMetrics = pocMetrics.count > 0 ? {
      avgMRR: pocMetrics.avgMRR / pocMetrics.count,
      totalBusinessSites: pocMetrics.totalBusinessSites,
      avgHardwareValue: pocMetrics.avgHardwareValue / pocMetrics.count
    } : null;

    // Get recent activities
    const recentActivities = await prisma.organization.findMany({
      where: {
        assignedToId: userId
      },
      select: {
        name: true,
        salesStage: true,
        lastActivityNote: true,
        lastActivityType: true,
        lastContactDate: true,
        nextFollowUpDate: true
      },
      orderBy: {
        lastContactDate: 'desc'
      },
      take: 5
    });

    // Format recent activities
    const formattedActivities = recentActivities.map(activity => ({
      organizationName: activity.name,
      stage: activity.salesStage,
      lastActivity: activity.lastActivityNote || 'No activity recorded',
      nextFollowup: activity.nextFollowUpDate ? 
        new Date(activity.nextFollowUpDate).toLocaleDateString() : 
        'No followup scheduled'
    }));

    // Count pending followups
    const pendingFollowups = await prisma.organization.count({
      where: {
        assignedToId: userId,
        nextFollowUpDate: {
          lte: new Date()
        }
      }
    });

    // Count active POCs
    const activePOCs = await prisma.organization.count({
      where: {
        assignedToId: userId,
        salesStage: 'POC',
        POC: {
          some: {
            POCStatus: 'ACTIVE'
          }
        }
      }
    });

    return {
      user: {
        username: user.username
      },
      totalOrganizations: organizations.length,
      activePOCs,
      pipelineValue,
      pendingFollowups,
      pocMetrics: finalPocMetrics,
      stageDistribution,
      monthlyPerformance: formattedMonthlyPerformance,
      recentActivities: formattedActivities
    };
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    throw error(500, 'Failed to load dashboard data');
  }
};