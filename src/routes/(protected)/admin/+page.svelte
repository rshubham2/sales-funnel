
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { 
    Users, 
    TrendingUp, 
    BarChart2, 
    PieChart,
    ArrowUpRight,
    ArrowDownRight
  } from 'lucide-svelte';

  const stats = [
    {
      title: "Total Leads",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Users
    },
    {
      title: "Conversion Rate",
      value: "35%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Avg Deal Size",
      value: "₹25L",
      change: "-3%",
      trend: "down",
      icon: BarChart2
    },
    {
      title: "Pipeline Value",
      value: "₹2.5Cr",
      change: "+8%",
      trend: "up",
      icon: PieChart
    }
  ];

  const stages = [
    { name: 'Lead', count: 45, percentage: 70 },
    { name: 'Qualification', count: 32, percentage: 60 },
    { name: 'Presentation', count: 28, percentage: 50 },
    { name: 'POC', count: 20, percentage: 40 },
    { name: 'Proposal', count: 15, percentage: 30 },
    { name: 'Negotiation', count: 10, percentage: 20 },
    { name: 'Order', count: 6, percentage: 10 }
  ];

$: if ($page.data.user?.role !== 'ADMIN') {
  goto('/');
}
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {#each stats as stat}
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-50 rounded-lg">
            <svelte:component this={stat.icon} class="text-blue-600" size={24} />
          </div>
          <div class="flex items-center gap-1 text-sm {stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}">
            {stat.change}
            <svelte:component this={stat.trend === 'up' ? ArrowUpRight : ArrowDownRight} size={16} />
          </div>
        </div>
        <h3 class="text-gray-600 text-sm mb-1">{stat.title}</h3>
        <p class="text-2xl font-bold text-gray-900">{stat.value}</p>
      </div>
    {/each}
  </div>

  <!-- Pipeline Stages -->
  <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Pipeline Stages</h2>
    <div class="space-y-4">
      {#each stages as stage}
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">{stage.name}</span>
            <span class="text-sm text-gray-600">{stage.count} leads</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full" 
              style="width: {stage.percentage}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
      <button class="text-blue-600 text-sm hover:text-blue-700">View all</button>
    </div>
    <!-- Add your activity list here -->
  </div>
</div>