
<!-- src/routes/(protected)/sales/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { ChartConfiguration } from 'chart.js';
  
  export let data;
  let pipelineChart: Chart;
  let performanceChart: Chart;
  let revenueChart: Chart;
  
  // Refined color palette with softer, professional colors
  const chartTheme = {
    fonts: {
      base: 'Inter, system-ui, sans-serif'
    },
    colors: {
      primary: '#4f76b9',
      success: '#3d8f78',
      warning: '#c39351',
      danger: '#b5565d',
      purple: '#8c7aa9',
      teal: '#5b9b98',
      gray: '#828a98'
    }
  };

  // Types for performance data
  interface PerformanceData {
    month: string;
    dealsCount: number;
    revenueValue?: number;  // Making revenue optional
  }

  interface DashboardData {
    user: { username: string };
    stageDistribution: Record<string, number>;
    monthlyPerformance: PerformanceData[];
    pipelineValue: number;
    totalOrganizations: number;
    pocMetrics?: {
      avgMRR: number;
      totalBusinessSites: number;
      avgHardwareValue: number;
    };
    recentActivities: Array<{
      organizationName: string;
      stage: string;
      lastActivity: string;
      nextFollowup: string;
      lastActivityDate?: string;
      category?: string;
      isActive?: boolean;
    }>;
    activePOCs: number;
    pendingFollowups: number;
  }

  function getGreeting(username: string) {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }
    
    return `${greeting}, ${username}`;
  }

  const formatAmount = (amount: number | null | undefined, compact = false) => {
    if (amount == null) return '₹0';
    
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: compact ? 'compact' : 'standard',
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '₹0';
    }
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  onMount(() => {
    if (!data) return;
    initPipelineChart();
    initPerformanceChart();
    initRevenueChart();
  });

  function initPipelineChart() {
    const ctx = document.getElementById('pipelineChart') as HTMLCanvasElement;
    if (ctx && data.stageDistribution) {
      if (pipelineChart) pipelineChart.destroy();
      
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: Object.keys(data.stageDistribution).map(stage => 
            stage.split('_').map(word => 
              word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')
          ),
          datasets: [{
            data: Object.values(data.stageDistribution),
            backgroundColor: [
              '#e2e8f4',
              '#dae5e8',
              '#e8e6df',
              '#e5e1eb',
              '#dfe8e7',
              '#e8e2e2'
            ],
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  family: chartTheme.fonts.base,
                  size: 12
                },
                padding: 20
              }
            }
          }
        }
      };
      
      pipelineChart = new Chart(ctx, config);
    }
  }

  function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (ctx && data.monthlyPerformance) {
      if (performanceChart) performanceChart.destroy();
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: data.monthlyPerformance.map(d => d.month),
          datasets: [{
            label: 'Deals Closed',
            data: data.monthlyPerformance.map(d => d.dealsCount),
            backgroundColor: '#e2e8f4',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: '#f1f5f9'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      };
      
      performanceChart = new Chart(ctx, config);
    }
  }

  function initRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx || !data.monthlyPerformance) return;
    
    if (revenueChart) revenueChart.destroy();
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.monthlyPerformance.map(d => d.month),
        datasets: [{
          label: 'Revenue Trend',
          data: data.monthlyPerformance.map(d => d.dealsCount || 0),
          borderColor: '#4f76b9',
          backgroundColor: 'rgba(79, 118, 185, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: '#f1f5f9'
            }
          }
        }
      }
    };
    
    revenueChart = new Chart(ctx, config);
  }

  // Calculate quick stats
  $: quickStats = {
    avgDealSize: data?.pipelineValue ? data.pipelineValue / data.totalOrganizations : 0,
    conversionRate: data?.totalOrganizations ? 
      (data.monthlyPerformance?.reduce((acc, curr) => acc + curr.dealsCount, 0) / data.totalOrganizations) * 100 : 0,
    activeDeals: data?.totalOrganizations - (data?.stageDistribution?.CLOSED_LOST || 0)
  };
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <div class="greeting-section">
      <h1>{getGreeting(data?.user?.username || 'User')}</h1>
      <p class="subtitle">Sales Performance Overview</p>
    </div>
    
    <div class="header-actions">
      <div class="date-filter">
        <select class="select-input">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      <button class="refresh-btn">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Refresh
      </button>
    </div>
  </header>

  <!-- Quick Stats Row -->
  <div class="quick-stats">
    <div class="stat-card highlight">
      <div class="stat-icon">💰</div>
      <div class="stat-content">
        <h3>Pipeline Value</h3>
        <p class="stat-value">{formatAmount(data?.pipelineValue, true)}</p>
        
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🎯</div>
      <div class="stat-content">
        <h3>Active POCs</h3>
        <p class="stat-value">{data?.activePOCs || 0}</p>
        <p class="stat-trend">Current Phase</p>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📈</div>
      <div class="stat-content">
        <h3>Avg Deal Size</h3>
        <p class="stat-value">{formatAmount(quickStats.avgDealSize, true)}</p>
        <p class="stat-trend neutral">= Stable</p>
      </div>
    </div>

    <div class="stat-card warning">
      <div class="stat-icon">⏰</div>
      <div class="stat-content">
        <h3>Pending Follow-ups</h3>
        <p class="stat-value">{data?.pendingFollowups || 0}</p>
        <p class="stat-trend negative">Requires Attention</p>
      </div>
    </div>
  </div>

  <!-- POC Metrics Section -->
  {#if data?.pocMetrics}
    <div class="poc-metrics">
      <h3>POC Performance Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-label">Average MRR</span>
          <span class="metric-value">{formatAmount(data.pocMetrics.avgMRR)}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Business Sites</span>
          <span class="metric-value">{data.pocMetrics.totalBusinessSites}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Avg Hardware Value</span>
          <span class="metric-value">{formatAmount(data.pocMetrics.avgHardwareValue)}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Conversion Rate</span>
          <span class="metric-value">{quickStats.conversionRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Charts Grid -->
  <div class="charts-grid">
    <div class="chart-card">
      <div class="chart-header">
        <h3>Sales Pipeline Distribution</h3>
        <div class="chart-actions">
          <button class="chart-action-btn">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="pipelineChart"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>Monthly Performance</h3>
        <div class="chart-actions">
          <button class="chart-action-btn">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="performanceChart"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-header">
        <h3>Revenue Trend</h3>
        <div class="chart-actions">
          <button class="chart-action-btn">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>
  </div>

</div>

<style>
  .dashboard {
    padding: 2rem;
    background-color: #fafbfc;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .greeting-section h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3545;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .stat-card {
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e9ef;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .stat-card.highlight {
    background-color: #f8fafc;
    border-left: 4px solid #4f76b9;
  }

  .stat-card.warning {
    border-left: 4px solid #c39351;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3545;
    margin-bottom: 0.25rem;
  }

  .stage-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .stage-badge.prospect { background-color: #f1f5f9; color: #4f76b9; }
  .stage-badge.poc { background-color: #f7f3ea; color: #c39351; }
  .stage-badge.closed_won { background-color: #eef3f1; color: #3d8f78; }
  .stage-badge.closed_lost { background-color: #f5eced; color: #b5565d; }

  /* Update other color-related styles similarly */
  .chart-card {
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e9ef;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .select-input {
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border: 1px solid #e5e9ef;
    border-radius: 0.5rem;
    background-color: white;
    color: #2c3545;
    font-size: 0.875rem;
  }







  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .select-input {
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: white;
    color: #0f172a;
    font-size: 0.875rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    color: #475569;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }



  .stat-card:hover {
    transform: translateY(-2px);
  }


  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .stat-content h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .highlight .stat-value,
  .highlight .stat-content h3 {
    color: white;
  }

  .stat-trend {
    font-size: 0.75rem;
    color: #64748b;
  }

  .stat-trend.positive {
    color: #059669;
  }

  .stat-trend.negative {
    color: #dc2626;
  }

  .poc-metrics {
    background-color: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 2rem;
  }

  .poc-metrics h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .metric-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
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
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .chart-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
  }

  .chart-container {
    height: 300px;
    position: relative;
  }

  .activities-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
  }

  .view-all-btn {
    padding: 0.5rem 1rem;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    color: #475569;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .org-info {
    display: flex;
    flex-direction: column;
  }

  .org-name {
    font-weight: 500;
    color: #0f172a;
  }

  .org-category {
    font-size: 0.75rem;
    color: #64748b;
  }

  .stage-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .stage-badge.prospect { background-color: #dbeafe; color: #1d4ed8; }
  .stage-badge.poc { background-color: #fef3c7; color: #b45309; }
  .stage-badge.closed_won { background-color: #dcfce7; color: #15803d; }
  .stage-badge.closed_lost { background-color: #fee2e2; color: #b91c1c; }

  .activity-info {
    display: flex;
    flex-direction: column;
  }

  .activity-desc {
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .activity-date {
    font-size: 0.75rem;
    color: #64748b;
  }

  .followup-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .overdue-badge {
    padding: 0.125rem 0.375rem;
    background-color: #fee2e2;
    color: #b91c1c;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-indicator {
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    background-color: #f1f5f9;
    color: #64748b;
  }

  .status-indicator.active {
    background-color: #dcfce7;
    color: #15803d;
  }

  .actions-cell {
    text-align: right;
  }

  .action-btn {
    padding: 0.375rem;
    border-radius: 0.375rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>