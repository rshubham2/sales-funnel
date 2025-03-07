<!-- src/routes/organizations/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { format } from 'date-fns';
  import { fade } from 'svelte/transition';
  
  export let data;
  let organizations = data.organizations;
  let searchTerm = '';
  let selectedStageFilter = 'ALL';
  let selectedPriorityFilter = 'ALL';
  let sortField = 'lastContactDate';
  let sortDirection = 'desc';
  
  // Filters
  const stageFilters = ['ALL', 'PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 
                        'POC', 'PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST'];
  const priorityFilters = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
  
  $: filteredOrganizations = organizations
    .filter(org => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
                          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (org.lastActivityNote && org.lastActivityNote.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Stage filter
      const matchesStage = selectedStageFilter === 'ALL' || org.salesStage === selectedStageFilter;
      
      // Priority filter
      const matchesPriority = selectedPriorityFilter === 'ALL' || org.priority === selectedPriorityFilter;
      
      return matchesSearch && matchesStage && matchesPriority;
    })
    .sort((a, b) => {
      if (sortField === 'lastContactDate' || sortField === 'nextFollowUpDate') {
        const dateA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const dateB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'name' || sortField === 'priority' || sortField === 'salesStage') {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return 0;
    });
  
  function getPriorityClass(priority: string): string {
    const classes = {
      'HIGH': 'bg-red-100 text-red-800 border border-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'LOW': 'bg-green-100 text-green-800 border border-green-200'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }
  
  function getSalesStageClass(stage: string): string {
    const classes = {
      'PROSPECT': 'bg-gray-100 text-gray-800 border border-gray-200',
      'LEAD': 'bg-blue-100 text-blue-800 border border-blue-200',
      'QUALIFICATION': 'bg-purple-100 text-purple-800 border border-purple-200',
      'PRESENTATION': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'POC': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'PROPOSAL': 'bg-orange-100 text-orange-800 border border-orange-200',
      'NEGOTIATION': 'bg-pink-100 text-pink-800 border border-pink-200',
      'ORDER': 'bg-green-100 text-green-800 border border-green-200',
      'CLOSED_WON': 'bg-green-200 text-green-800 border border-green-300',
      'CLOSED_LOST': 'bg-red-200 text-red-800 border border-red-300'
    };
    return classes[stage] || 'bg-gray-100 text-gray-800';
  }

  function getSalesStageProgress(stage: string): number {
    const stages = {
      'PROSPECT': 10,
      'LEAD': 20,
      'QUALIFICATION': 30,
      'PRESENTATION': 40,
      'POC': 50,
      'PROPOSAL': 60,
      'NEGOTIATION': 80,
      'ORDER': 90,
      'CLOSED_WON': 100,
      'CLOSED_LOST': 0
    };
    return stages[stage] || 0;
  }
  
  function formatDate(date: string | null): string {
    if (!date) return '-';
    return format(new Date(date), 'MMM d, yyyy');
  }
  
  function getTimeSince(date: string | null): string {
    if (!date) return '';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
  
  function handleRowClick(organizationId: string) {
    goto(`/sales/organizations/${organizationId}`);
  }

  function sort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'desc';
    }
  }

  function getContactUrgency(org) {
    if (!org.lastContactDate) return 'high';
    const daysSinceContact = Math.floor((Date.now() - new Date(org.lastContactDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceContact > 30) return 'high';
    if (daysSinceContact > 14) return 'medium';
    return 'low';
  }

  function isFollowUpDue(date: string | null): boolean {
    if (!date) return false;
    return new Date(date) <= new Date();
  }

  function clearFilters() {
    searchTerm = '';
    selectedStageFilter = 'ALL';
    selectedPriorityFilter = 'ALL';
  }

  function showStageFilterChip(stage: string) {
    return stage !== 'ALL' && stage === selectedStageFilter;
  }

  function showPriorityFilterChip(priority: string) {
    return priority !== 'ALL' && priority === selectedPriorityFilter;
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-6">
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <h1 class="text-2xl font-semibold text-gray-900">Organizations</h1>
      <p class="mt-2 text-sm text-gray-700">
        Track and manage your sales pipeline across {organizations.length} organizations.
      </p>
    </div>
  </div>

  <!-- Integrated search and filter bar -->
  <div class="mt-6 bg-white rounded-lg shadow">
    <div class="p-4 border-b border-gray-200">
      <div class="relative flex w-full items-center">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type="search"
          bind:value={searchTerm}
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
          placeholder="Search organizations, websites, or notes..."
        />
        <div class="ml-4 flex items-center gap-2">
          <!-- Stage Filter Dropdown -->
          <div class="relative inline-block text-left">
            <select
              bind:value={selectedStageFilter}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              <option value="ALL">All Stages</option>
              {#each stageFilters.filter(f => f !== 'ALL') as stage}
                <option value={stage}>{stage.replace('_', ' ')}</option>
              {/each}
            </select>
          </div>

          <!-- Priority Filter Dropdown -->
          <div class="relative inline-block text-left">
            <select
              bind:value={selectedPriorityFilter}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              <option value="ALL">All Priorities</option>
              {#each priorityFilters.filter(f => f !== 'ALL') as priority}
                <option value={priority}>{priority}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Active filter chips -->
      {#if searchTerm || selectedStageFilter !== 'ALL' || selectedPriorityFilter !== 'ALL'}
        <div class="flex flex-wrap gap-2 mt-4" transition:fade={{duration: 150}}>
          {#if searchTerm}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Search: "{searchTerm}"
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-indigo-200" on:click={() => searchTerm = ''}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}

          {#if selectedStageFilter !== 'ALL'}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Stage: {selectedStageFilter.replace('_', ' ')}
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-blue-200" on:click={() => selectedStageFilter = 'ALL'}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}

          {#if selectedPriorityFilter !== 'ALL'}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getPriorityClass(selectedPriorityFilter)}">
              Priority: {selectedPriorityFilter}
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-opacity-75" on:click={() => selectedPriorityFilter = 'ALL'}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}

          {#if searchTerm || selectedStageFilter !== 'ALL' || selectedPriorityFilter !== 'ALL'}
            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 ml-auto"
              on:click={clearFilters}
            >
              Clear all filters
            </button>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Organizations count summary -->
    <div class="px-4 py-3 bg-gray-50 text-gray-600 text-sm rounded-b-lg">
      Showing <span class="font-medium">{filteredOrganizations.length}</span> of <span class="font-medium">{organizations.length}</span> organizations
    </div>
  </div>

  <div class="mt-6 flex flex-col">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button 
                    class="group inline-flex items-center focus:outline-none" 
                    on:click={() => sort('name')}
                  >
                    Organization
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      {#if sortField === 'name'}
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" : "M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"} clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button 
                    class="group inline-flex items-center focus:outline-none" 
                    on:click={() => sort('salesStage')}
                  >
                    Sales Pipeline
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      {#if sortField === 'salesStage'}
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" : "M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"} clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button 
                    class="group inline-flex items-center focus:outline-none" 
                    on:click={() => sort('priority')}
                  >
                    Priority
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      {#if sortField === 'priority'}
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" : "M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"} clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Assigned To</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button 
                    class="group inline-flex items-center focus:outline-none" 
                    on:click={() => sort('lastContactDate')}
                  >
                    Last Activity
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      {#if sortField === 'lastContactDate'}
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" : "M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"} clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </span>
                  </button>
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button 
                    class="group inline-flex items-center focus:outline-none" 
                    on:click={() => sort('nextFollowUpDate')}
                  >
                    Next Follow-up
                    <span class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      {#if sortField === 'nextFollowUpDate'}
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" : "M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 01-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"} clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {#each filteredOrganizations as org}
                <tr 
                  class="cursor-pointer hover:bg-gray-50 transition duration-150"
                  on:click={() => handleRowClick(org.organizationId)}
                >
                  <td class="px-3 py-4">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">{org.name}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {#if org.website}
                          <span class="text-indigo-600">
                            {org.website.replace(/^https?:\/\//i, '')}
                          </span>
                        {:else}
                          <span class="text-gray-400">No website</span>
                        {/if}
                      </div>
                      {#if org.tags && org.tags.length > 0}
                        <div class="flex flex-wrap gap-1 mt-2">
                          {#each org.tags.slice(0, 2) as tag}
                            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">{tag}</span>
                          {/each}
                          {#if org.tags.length > 2}
                            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">+{org.tags.length - 2}</span>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-3 py-4">
                    <div class="flex flex-col space-y-2">
                      <span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 {getSalesStageClass(org.salesStage)}">
                        {org.salesStage.replace('_', ' ')}
                      </span>
                      
                      <!-- Progress bar -->
                      <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="h-2.5 rounded-full" 
                             style="width: {getSalesStageProgress(org.salesStage)}%; background-color: {org.salesStage === 'CLOSED_LOST' ? '#ef4444' : '#22c55e'}">
                        </div>
                      </div>
                      
                      {#if org.contacts && org.contacts.length > 0}
                        <div class="text-xs text-gray-500 mt-1">
                          {org.contacts.length} contact{org.contacts.length > 1 ? 's' : ''}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-3 py-4">
                    <span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 {getPriorityClass(org.priority)}">
                      {org.priority}
                    </span>
                  </td>
                  <td class="px-3 py-4">
                    {#if org.assignedTo}
                      <div class="flex items-center">
                        <div class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                          {org.assignedTo.username.charAt(0).toUpperCase()}
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900">{org.assignedTo.username}</div>
                          <div class="text-xs text-gray-500">{org.assignedTo.email}</div>
                        </div>
                      </div>
                    {:else}
                      <span class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Unassigned
                      </span>
                    {/if}
                  </td>
                  <td class="px-3 py-4">
                    <div class="flex flex-col">
                      {#if org.lastContactDate}
                        <div class="flex items-center">
                          <div class={`h-2 w-2 rounded-full mr-2 ${getContactUrgency(org) === 'high' ? 'bg-red-500' : getContactUrgency(org) === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                          <span class="text-sm text-gray-700">{formatDate(org.lastContactDate)}</span>
                        </div>
                        <span class="text-xs text-gray-500 mt-1">{getTimeSince(org.lastContactDate)}</span>
                      {:else}
                        <span class="text-sm text-gray-500">No recent contact</span>
                      {/if}
                      
                      {#if org.lastActivityType}
                        <div class="mt-1 text-xs text-gray-500 flex items-center">
                          <span class="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1"></span>
                          {org.lastActivityType}
                        </div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-3 py-4">
                    {#if org.nextFollowUpDate}
                      <div class={`text-sm ${isFollowUpDue(org.nextFollowUpDate) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                        {formatDate(org.nextFollowUpDate)}
                        {#if isFollowUpDue(org.nextFollowUpDate)}
                          <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">Due</span>
                        {/if}
                      </div>
                      
                      {#if org.nextFollowUpNote}
                        <div class="mt-1 text-xs text-gray-500 overflow-hidden text-ellipsis">
                          "{org.nextFollowUpNote}"
                        </div>
                      {/if}
                    {:else}
                      <div class="flex items-center">
                        <span class="text-sm text-gray-500">Not scheduled</span>
                      </div>
                    {/if}
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="6" class="px-3 py-10 text-center text-sm text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 class="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
                      <p class="mt-1 text-sm text-gray-500">
                        {#if searchTerm || selectedStageFilter !== 'ALL' || selectedPriorityFilter !== 'ALL'}
                          Try adjusting your search or filter criteria.
                        {:else}
                          Get started by adding your first organization.
                        {/if}
                      </p>
                      {#if !searchTerm && selectedStageFilter === 'ALL' && selectedPriorityFilter === 'ALL'}
                        <div class="mt-6">
                          <button
                            type="button"
                            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            on:click={() => goto('/sales/organizations/new')}
                          >
                            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                            </svg>
                            Add organization
                          </button>
                        </div>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Add organization floating button -->
  <div class="fixed bottom-4 right-4">
    <button
      type="button"
      class="inline-flex items-center p-3 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      on:click={() => goto('/sales/organizations/new')}
    >
      <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>
  </div>
</div>