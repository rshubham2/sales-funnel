<!-- src/routes/(protected)/admin/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import UserPerformanceTable from '$lib/components/UserPerformanceTable.svelte';
  import UserPerformanceChart from '$lib/components/UserPerformanceChart.svelte';
  
  export let data;

  let userMetrics = data.userMetrics;

  let salesStageChart: Chart;
  let revenueChart: Chart;

  // Add this to check the data structure
  console.log('Dashboard Data:', data);

  onMount(() => {
    if (!data) return;

    // Initialize Sales Stage Chart
    initSalesStageChart();
    
    // Initialize Revenue Chart
    initRevenueChart();
  });

  // Separate the chart initialization into functions
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
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <h1>Admin Dashboard</h1>
    <div class="date-filter">
      <select class="select-input">
        <option value="month" selected>This Month</option>
        <option value="quarter">This Quarter</option>
        <option value="year">This Year</option>
      </select>
    </div>
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
        <h3>Average Deal Size</h3>
        <p class="metric-value">{formatAmount(data.avgDealSize)}</p>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-content">
        <h3>Average MRR</h3>
        <p class="metric-value">{formatAmount(data.pocStats.avgMRR)}</p>
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

  {#if data.userMetrics}
    <div class="performance-section">
      <h2 class="section-title">Sales Team Performance</h2>
      <UserPerformanceChart {userMetrics} />
      <UserPerformanceTable {userMetrics} />
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
  }

  .chart-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  }

  .performance-section {
    margin-top: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  
  .performance-section {
    margin-top: 2ream;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }
</style>