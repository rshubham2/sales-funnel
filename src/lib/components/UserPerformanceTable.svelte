<!-- src/lib/components/UserPerformanceTable.svelte -->
<script lang="ts">
  export let userMetrics: Array<{
    username: string;
    totalDeals: number;
    wonDeals: number;
    revenue: number;
    winRate: number;
    avgDealSize: number;
  }>;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
</script>

<div class="user-performance">
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Sales Rep</th>
          <th>Total Deals</th>
          <th>Won Deals</th>
          <th>Win Rate</th>
          <th>Revenue</th>
          <th>Avg Deal Size</th>
        </tr>
      </thead>
      <tbody>
        {#each userMetrics as user}
          <tr>
            <td>{user.username}</td>
            <td>{user.totalDeals}</td>
            <td>{user.wonDeals}</td>
            <td class="win-rate">
              <div class="progress-bar" style="--progress: {user.winRate}%">
                <span>{formatPercent(user.winRate)}</span>
              </div>
            </td>
            <td>{formatAmount(user.revenue)}</td>
            <td>{formatAmount(user.avgDealSize)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .user-performance {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-top: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background-color: #f9fafb;
    font-weight: 500;
    color: #4b5563;
  }

  td {
    color: #111827;
  }

  .win-rate {
    width: 150px;
  }

  .progress-bar {
    background-color: #e5e7eb;
    border-radius: 9999px;
    height: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .progress-bar::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: var(--progress);
    background-color: #3b82f6;
    transition: width 0.3s ease;
  }

  .progress-bar span {
    position: absolute;
    left: 0.5rem;
    right: 0.5rem;
    text-align: center;
    color: white;
    font-size: 0.875rem;
    line-height: 1.5rem;
    z-index: 1;
  }
</style>