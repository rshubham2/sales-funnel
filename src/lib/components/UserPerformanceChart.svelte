<!-- src/lib/components/UserPerformanceChart.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  export let userMetrics: Array<{
    username: string;
    revenue: number;
    winRate: number;
  }>;

  let chart: Chart;

  onMount(() => {
    const ctx = document.getElementById('userPerformanceChart') as HTMLCanvasElement;
    if (ctx) {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: userMetrics.map(user => user.username),
          datasets: [
            {
              label: 'Revenue',
              data: userMetrics.map(user => user.revenue),
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              yAxisID: 'y'
            },
            {
              label: 'Win Rate',
              data: userMetrics.map(user => user.winRate),
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Sales Performance by User'
            }
          },
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Revenue (₹)'
              }
            },
            y1: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Win Rate (%)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }
  });
</script>

<div class="chart-container">
  <canvas id="userPerformanceChart"></canvas>
</div>

<style>
  .chart-container {
    height: 300px;
    position: relative;
  }
</style>