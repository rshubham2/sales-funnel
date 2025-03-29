<!-- src/routes/sales/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
  import { ChevronDown, Calendar, Clock, AlertCircle, CheckCircle, User, Tag, ChevronUp, ChevronRight } from 'lucide-svelte';
  
  export let data: PageData;
  
  // Stage colors for visual indicators
  const stageColors = {
    PROSPECT: 'bg-blue-100 text-blue-800',
    LEAD: 'bg-blue-200 text-blue-800',
    QUALIFICATION: 'bg-purple-100 text-purple-800',
    PRESENTATION: 'bg-indigo-100 text-indigo-800',
    POC: 'bg-pink-100 text-pink-800',
    PROPOSAL: 'bg-orange-100 text-orange-800',
    NEGOTIATION: 'bg-yellow-100 text-yellow-800',
    ORDER: 'bg-green-100 text-green-800',
    CLOSED_WON: 'bg-emerald-100 text-emerald-800',
    CLOSED_LOST: 'bg-red-100 text-red-800'
  };
  
  // Priority colors
  const priorityColors = {
    HIGH: 'bg-red-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-blue-500'
  };
  
  // Format dates for display
  function formatDate(date: Date | null | undefined): string {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  }
  
  function getFollowUpStatus(date: Date | null | undefined): string {
    if (!date) return 'bg-gray-100 text-gray-800';
    if (isPast(date) && !isToday(date)) return 'bg-red-100 text-red-800';
    if (isToday(date)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }
  
  function getFollowUpText(date: Date | null | undefined): string {
    if (!date) return 'No follow-up scheduled';
    if (isPast(date) && !isToday(date)) return `Overdue by ${formatDistanceToNow(date)}`;
    if (isToday(date)) return 'Due today';
    return `In ${formatDistanceToNow(date)}`;
  }
  
  // Dashboard metrics
  $: totalOrgs = data.organizations.length;
  $: highPriorityCount = data.organizations.filter(org => org.priority === 'HIGH').length;
  $: overdueFollowUps = data.organizations.filter(org => 
    org.nextFollowUpDate && isPast(org.nextFollowUpDate) && !isToday(org.nextFollowUpDate)
  ).length;
  $: todayFollowUps = data.organizations.filter(org => 
    org.nextFollowUpDate && isToday(org.nextFollowUpDate)
  ).length;
  
  // Group by sales stage for the pipeline view
  $: stageCounts = data.organizations.reduce((acc, org) => {
    acc[org.salesStage] = (acc[org.salesStage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Filter states
  let showFilters = false;
  let priorityFilter = 'all';
  let stageFilter = 'all';
  let searchQuery = '';
  
  // Filtered organizations
  $: filteredOrganizations = data.organizations.filter(org => {
    const matchesPriority = priorityFilter === 'all' || org.priority === priorityFilter;
    const matchesStage = stageFilter === 'all' || org.salesStage === stageFilter;
    const matchesSearch = searchQuery === '' || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.lastActivityNote && org.lastActivityNote.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (org.tags && org.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesPriority && matchesStage && matchesSearch;
  });
</script>

<div class="p-6 max-w-7xl mx-auto">
  <h1 class="text-3xl font-bold mb-8">Sales Dashboard</h1>
  
  <!-- Dashboard Overview Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <!-- Total Accounts -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500 text-sm">Total Accounts</p>
          <p class="text-2xl font-bold">{totalOrgs}</p>
        </div>
        <div class="rounded-full bg-blue-100 p-3">
          <User class="text-blue-600 h-6 w-6" />
        </div>
      </div>
    </div>
    
    <!-- High Priority Accounts -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500 text-sm">High Priority</p>
          <p class="text-2xl font-bold">{highPriorityCount}</p>
        </div>
        <div class="rounded-full bg-red-100 p-3">
          <AlertCircle class="text-red-600 h-6 w-6" />
        </div>
      </div>
    </div>
    
    <!-- Overdue Follow-ups -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500 text-sm">Overdue Follow-ups</p>
          <p class="text-2xl font-bold">{overdueFollowUps}</p>
        </div>
        <div class="rounded-full bg-orange-100 p-3">
          <Clock class="text-orange-600 h-6 w-6" />
        </div>
      </div>
    </div>
    
    <!-- Today's Follow-ups -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500 text-sm">Today's Follow-ups</p>
          <p class="text-2xl font-bold">{todayFollowUps}</p>
        </div>
        <div class="rounded-full bg-green-100 p-3">
          <Calendar class="text-green-600 h-6 w-6" />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Sales Pipeline -->
  <div class="bg-white rounded-lg shadow p-6 mb-8">
    <h2 class="text-xl font-bold mb-4">Sales Pipeline</h2>
    <div class="flex flex-wrap gap-2">
      {#each Object.entries(stageCounts) as [stage, count]}
        <div class="flex items-center">
          <div class={`h-8 flex items-center px-3 rounded-md ${stageColors[stage] || 'bg-gray-100'}`}>
            <span class="text-sm font-medium">{stage}: {count}</span>
          </div>
          {#if stage !== 'CLOSED_LOST' && stage !== 'CLOSED_WON'}
            <ChevronRight class="text-gray-400 h-4 w-4" />
          {/if}
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Organization List Section -->
  <div class="bg-white rounded-lg shadow mb-8">
    <div class="border-b p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 class="text-xl font-bold">Your Accounts</h2>
        
        <div class="flex flex-wrap gap-2">
          <!-- Search input -->
          <div class="relative flex-grow">
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Search..." 
              class="border rounded-md px-3 py-2 text-sm w-full"
            />
          </div>
          
          <!-- Filter toggle -->
          <button 
            on:click={() => showFilters = !showFilters}
            class="border rounded-md px-3 py-2 text-sm flex items-center gap-1 bg-gray-50 hover:bg-gray-100"
          >
            Filter
            {#if showFilters}
              <ChevronUp class="h-4 w-4" />
            {:else}
              <ChevronDown class="h-4 w-4" />
            {/if}
          </button>
        </div>
      </div>
      
      <!-- Filters row -->
      {#if showFilters}
        <div class="mt-4 pt-4 border-t flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              bind:value={priorityFilter}
              class="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sales Stage</label>
            <select 
              bind:value={stageFilter}
              class="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Stages</option>
              <option value="PROSPECT">Prospect</option>
              <option value="LEAD">Lead</option>
              <option value="QUALIFICATION">Qualification</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="POC">POC</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="ORDER">Order</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </select>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Organizations table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Follow-up</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#if filteredOrganizations.length === 0}
            <tr>
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No organizations match your filters
              </td>
            </tr>
          {:else}
            {#each filteredOrganizations as org}
              <tr class="hover:bg-gray-50 cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">{org.name}</span>
                    {#if org.tags && org.tags.length > 0}
                      <div class="mt-1 flex flex-wrap gap-1">
                        {#each org.tags as tag}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[org.salesStage] || 'bg-gray-100'}`}>
                    {org.salesStage}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class={`h-2.5 w-2.5 rounded-full mr-2 ${priorityColors[org.priority] || 'bg-gray-300'}`}></div>
                    <span class="text-sm text-gray-900">{org.priority}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(org.lastContactDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-900">{formatDate(org.nextFollowUpDate)}</span>
                    <span class={`text-xs mt-1 px-2 py-0.5 rounded ${getFollowUpStatus(org.nextFollowUpDate)}`}>
                      {getFollowUpText(org.nextFollowUpDate)}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {#if org.lastActivityNote}
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-900">{org.lastActivityNote}</span>
                      {#if org.lastActivityType}
                        <span class="text-xs text-gray-500">{org.lastActivityType}</span>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-sm text-gray-500">No recent activity</span>
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Action Items Section -->
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-bold mb-4">Upcoming Follow-ups</h2>
    
    <div class="space-y-4">
      {#if filteredOrganizations.filter(org => org.nextFollowUpDate).length === 0}
        <p class="text-gray-500 text-center py-4">No upcoming follow-ups</p>
      {:else}
        {#each filteredOrganizations
          .filter(org => org.nextFollowUpDate)
          .sort((a, b) => {
            if (!a.nextFollowUpDate) return 1;
            if (!b.nextFollowUpDate) return -1;
            return new Date(a.nextFollowUpDate).getTime() - new Date(b.nextFollowUpDate).getTime();
          })
          .slice(0, 5) as org}
          <div class="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <div class="flex items-center gap-2">
                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[org.salesStage] || 'bg-gray-100'}`}>
                  {org.salesStage}
                </span>
                <h3 class="text-lg font-semibold">{org.name}</h3>
              </div>
              <p class="text-gray-600 text-sm mt-1">
                {org.lastActivityNote || 'No recent activity'} 
                {#if org.lastActivityType}
                  <span class="text-gray-500">({org.lastActivityType})</span>
                {/if}
              </p>
            </div>
            <div class="text-right">
              <div class={`mb-1 text-sm font-medium ${getFollowUpStatus(org.nextFollowUpDate)}`}>
                {getFollowUpText(org.nextFollowUpDate)}
              </div>
              <div class="text-xs text-gray-500">{formatDate(org.nextFollowUpDate)}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>