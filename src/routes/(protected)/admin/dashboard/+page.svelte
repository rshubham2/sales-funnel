<!-- // src/routes/(protected)/admin/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import UserPerformanceTable from '$lib/components/UserPerformanceTable.svelte';
  import UserPerformanceChart from '$lib/components/UserPerformanceChart.svelte';
  
  export let data;

  let userMetrics = data.userMetrics;
  let salesStageChart: Chart;
  let revenueChart: Chart;
  let verticalDistributionChart: Chart;
  let userClosureChart: Chart;

  onMount(() => {
    if (!data) return;

    // Initialize all charts
    initSalesStageChart();
    initRevenueChart();
    initVerticalDistributionChart();
    initUserClosureChart();
  });

  // Original chart initialization functions
  function initSalesStageChart() {
    const salesStageCtx = document.getElementById('salesStageChart') as HTMLCanvasElement;
    if (salesStageCtx) {
      if (salesStageChart) salesStageChart.destroy();
      salesStageChart = new Chart(salesStageCtx, {
        type: 'bar',
        data: {
          labels: data.salesStageDistribution.map(d => d.salesStage),
          datasets: [{
            label: 'Organizations',
            data: data.salesStageDistribution.map(d => d._count),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            },
            title: {
              display: true,
              text: 'Organizations by Sales Stage'
            }
          }
        }
      });
    }
  }

  function initRevenueChart() {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      if (revenueChart) revenueChart.destroy();
      revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Revenue',
            data: data.monthlyRevenue,
            borderColor: 'rgb(34, 197, 94)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            }
          }
        }
      });
    }
  }

  // Dynamic vertical distribution chart
  function initVerticalDistributionChart() {
    const verticalCtx = document.getElementById('verticalDistributionChart') as HTMLCanvasElement;
    if (verticalCtx && data.verticalData) {
      if (verticalDistributionChart) verticalDistributionChart.destroy();
      
      verticalDistributionChart = new Chart(verticalCtx, {
        type: 'bar',
        data: {
          labels: data.verticalData.map(v => v.vertical),
          datasets: [
            {
              label: 'Organizations',
              data: data.verticalData.map(v => v.count),
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Revenue (₹)',
              data: data.verticalData.map(v => v.revenue),
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 1,
              type: 'line',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            },
            title: {
              display: true,
              text: 'Distribution by Vertical'
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Organizations'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Revenue (₹)'
              }
            }
          }
        }
      });
    }
  }

  // Dynamic user closure chart
  function initUserClosureChart() {
    const userClosureCtx = document.getElementById('userClosureChart') as HTMLCanvasElement;
    if (userClosureCtx && userMetrics) {
      if (userClosureChart) userClosureChart.destroy();
      
      userClosureChart = new Chart(userClosureCtx, {
        type: 'bar',
        data: {
          labels: userMetrics.map(user => user.username),
          datasets: [
            {
              label: 'Closed Won',
              data: userMetrics.map(user => user.closedWonCount || 0),
              backgroundColor: 'rgba(34, 197, 94, 0.7)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 1
            },
            {
              label: 'Closed Lost',
              data: userMetrics.map(user => user.closedLostCount || 0),
              backgroundColor: 'rgba(239, 68, 68, 0.7)',
              borderColor: 'rgb(239, 68, 68)',
              borderWidth: 1
            },
            {
              label: 'In Progress',
              data: userMetrics.map(user => user.inProgressCount || 0),
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            },
            title: {
              display: true,
              text: 'Deals by User and Status'
            }
          },
          scales: {
            x: {
              stacked: false,
              title: {
                display: true,
                text: 'Users'
              }
            },
            y: {
              stacked: false,
              title: {
                display: true,
                text: 'Number of Deals'
              }
            }
          }
        }
      });
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate conversion rates
  const calculateConversionRate = (startCount: number, endCount: number) => {
    return startCount > 0 ? Math.round((endCount / startCount) * 100) : 0;
  };
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <h1>Admin Dashboard</h1>
  </header>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-content">
        <h3>Total Organizations</h3>
        <p class="metric-value">{data.organizationCount}</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-content">
        <h3>Total Revenue</h3>
        <p class="metric-value">{formatAmount(data.totalRevenue)}</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-content">
        <h3>Win Rate</h3>
        <p class="metric-value">{calculateConversionRate(data.opportunityCount || 0, data.closedWonCount || 0)}%</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-content">
        <h3>Average Deal Size</h3>
        <p class="metric-value">{formatAmount(data.avgDealSize)}</p>
      </div>
    </div>
  </div>

  <div class="charts-grid">
    <div class="chart-card">
      <h3>Sales Pipeline</h3>
      <div class="chart-container">
        <canvas id="salesStageChart"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <h3>Revenue Trend</h3>
      <div class="chart-container">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Vertical distribution chart - dynamically rendered -->
  {#if data.verticalData && data.verticalData.length > 0}
    <div class="chart-card full-width">
      <h3>Performance by Vertical</h3>
      <div class="chart-container">
        <canvas id="verticalDistributionChart"></canvas>
      </div>
    </div>
  {/if}

  <!-- Top performing verticals - dynamically rendered -->
  {#if data.topVerticals && data.topVerticals.length > 0}
    <div class="section-title">Top Performing Verticals</div>
    <div class="top-verticals-grid">
      {#each data.topVerticals as vertical}
        <div class="vertical-card">
          <h3>{vertical.name}</h3>
          <div class="vertical-stats">
            <div class="vertical-stat">
              <span class="stat-label">Total Deals</span>
              <span class="stat-value">{vertical.deals}</span>
            </div>
            <div class="vertical-stat">
              <span class="stat-label">Revenue</span>
              <span class="stat-value">{formatAmount(vertical.revenue)}</span>
            </div>
            <div class="vertical-stat">
              <span class="stat-label">Conversion Rate</span>
              <span class="stat-value">{vertical.conversionRate}%</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- User closure chart - dynamically rendered -->
  {#if userMetrics && userMetrics.length > 0}
    <div class="section-title">User Performance by Deal Status</div>
    <div class="chart-card full-width">
      <div class="chart-container">
        <canvas id="userClosureChart"></canvas>
      </div>
    </div>
  {/if}

  {#if data.userMetrics && data.userMetrics.length > 0}
    <div class="performance-section">
      <h2 class="section-title">Sales Team Performance</h2>
      <UserPerformanceChart userMetrics={data.userMetrics} />
      <UserPerformanceTable userMetrics={data.userMetrics} />
    </div>
  {/if}
</div>


<style>
  .dashboard {
    padding: 1.5rem;
    background-color: #f9fafb;
    min-height: 100vh;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .select-input {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .metric-content h3 {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .chart-card h3 {
    font-size: 1rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 1rem;
  }

  .chart-container {
    height: 300px;
    position: relative;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 2rem 0 1rem 0;
  }

  .performance-section {
    margin-top: 2rem;
  }

  .top-verticals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .vertical-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .vertical-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .vertical-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  .vertical-stat {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  @media (max-width: 640px) {
    .dashboard {
      padding: 1rem;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .top-verticals-grid {
      grid-template-columns: 1fr;
    }
  }
</style>