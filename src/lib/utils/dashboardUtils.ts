// src/lib/utils/dashboardUtils.ts
export function calculateMetrics(organizations, users, orders) {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.finalOrderValue || 0), 0);
  const activeDeals = organizations.filter(org => 
    !['CLOSED_WON', 'CLOSED_LOST'].includes(org.salesStage)
  ).length;

  const closedDeals = orders.length;
  const totalDeals = organizations.length;
  const conversionRate = totalDeals ? (closedDeals / totalDeals) * 100 : 0;

  const avgDealSize = closedDeals ? totalRevenue / closedDeals : 0;

  return {
    totalRevenue,
    activeDeals,
    conversionRate,
    avgDealSize,
    totalUsers: users.length,
    monthlyLeads: Math.round(organizations.filter(org => 
      org.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length)
  };
}

export function calculateStageDistribution(organizations) {
  const stages = ['PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 'POC', 
                 'PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST'];
  
  return stages.map(stage => ({
    stage,
    count: organizations.filter(org => org.salesStage === stage).length
  }));
}

export function calculateTopPerformers(users, orders) {
  return users
    .map(user => {
      const userOrders = orders.filter(order => 
        order.organization.assignedToId === user.id
      );
      
      return {
        id: user.id,
        name: user.username,
        deals: userOrders.length,
        revenue: userOrders.reduce((sum, order) => sum + (order.finalOrderValue || 0), 0)
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}