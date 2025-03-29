<!-- src/routes/organizations/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { format } from 'date-fns';
  import { fade, fly } from 'svelte/transition';
  import debounce from 'lodash/debounce';
  
  export let data;
  let organizations = data.organizations;
  let searchTerm = '';
  let selectedStageFilter = 'ALL';
  let selectedPriorityFilter = 'ALL';
  let selectedTagFilter = 'ALL';
  let sortField = 'lastContactDate';
  let sortDirection = 'desc';
  let isFilterExpanded = false;
  
  // Filters
  const stageFilters = ['ALL', ...data.filterOptions.stages];
  const priorityFilters = ['ALL', ...data.filterOptions.priorities];
  const tagFilters = ['ALL', ...data.filterOptions.tags];
  
  // Debounced search
  const debouncedSearch = debounce((term) => {
    searchTerm = term;
  }, 300);
  
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
      
      // Tag filter
      const matchesTag = selectedTagFilter === 'ALL' || 
                        (org.tags && org.tags.includes(selectedTagFilter));
      
      return matchesSearch && matchesStage && matchesPriority && matchesTag;
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
    selectedTagFilter = 'ALL';
  }

  function toggleFilterPanel() {
    isFilterExpanded = !isFilterExpanded;
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
  <div class="flex flex-wrap gap-4 items-center justify-between pb-5 border-b border-gray-200">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Organizations</h1>
      <p class="mt-1 text-sm text-gray-500">
        Track and manage your sales pipeline across {organizations.length} organizations.
      </p>
    </div>
    
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        on:click={() => goto('/sales/organizations/new')}
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add organization
      </button>
    </div>
  </div>

  <!-- Search and Filter Bar -->
  <div class="mt-6 bg-white rounded-lg shadow">
    <div class="p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Box -->
        <div class="relative flex-grow">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            on:input={(e) => debouncedSearch(e.target.value)}
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Search organizations, websites, or notes..."
          />
        </div>
        
        <!-- Filter Toggle Button -->
        <button 
          class="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          on:click={toggleFilterPanel}
        >
          <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filters
          {#if selectedStageFilter !== 'ALL' || selectedPriorityFilter !== 'ALL' || selectedTagFilter !== 'ALL'}
            <span class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
              {(selectedStageFilter !== 'ALL' ? 1 : 0) + 
               (selectedPriorityFilter !== 'ALL' ? 1 : 0) + 
               (selectedTagFilter !== 'ALL' ? 1 : 0)}
            </span>
          {/if}
        </button>
      </div>
      
      <!-- Advanced Filter Panel -->
      {#if isFilterExpanded}
        <div class="mt-4 p-4 bg-gray-50 rounded-lg" transition:fly={{ y: -20, duration: 200 }}>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Stage Filter -->
            <div>
              <label for="stage-filter" class="block text-sm font-medium text-gray-700 mb-1">Sales Stage</label>
              <select
                id="stage-filter"
                bind:value={selectedStageFilter}
                class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                <option value="ALL">All Stages</option>
                {#each stageFilters.filter(f => f !== 'ALL') as stage}
                  <option value={stage}>{stage.replace('_', ' ')}</option>
                {/each}
              </select>
            </div>
            
            <!-- Priority Filter -->
            <div>
              <label for="priority-filter" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                id="priority-filter"
                bind:value={selectedPriorityFilter}
                class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                <option value="ALL">All Priorities</option>
                {#each priorityFilters.filter(f => f !== 'ALL') as priority}
                  <option value={priority}>{priority}</option>
                {/each}
              </select>
            </div>
            
            <!-- Tag Filter -->
            <div>
              <label for="tag-filter" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <select
                id="tag-filter"
                bind:value={selectedTagFilter}
                class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              >
                <option value="ALL">All Tags</option>
                {#each tagFilters.filter(f => f !== 'ALL') as tag}
                  <option value={tag}>{tag}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <div class="flex justify-end mt-4">
            <button
              type="button"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              on:click={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        </div>
      {/if}
      
      <!-- Active filter chips -->
      {#if searchTerm || selectedStageFilter !== 'ALL' || selectedPriorityFilter !== 'ALL' || selectedTagFilter !== 'ALL'}
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
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getSalesStageClass(selectedStageFilter)}">
              {selectedStageFilter.replace('_', ' ')}
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-opacity-75" on:click={() => selectedStageFilter = 'ALL'}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}

          {#if selectedPriorityFilter !== 'ALL'}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getPriorityClass(selectedPriorityFilter)}">
              {selectedPriorityFilter}
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-opacity-75" on:click={() => selectedPriorityFilter = 'ALL'}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}

          {#if selectedTagFilter !== 'ALL'}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Tag: {selectedTagFilter}
              <button type="button" class="ml-1.5 inline-flex rounded-full hover:bg-gray-200" on:click={() => selectedTagFilter = 'ALL'}>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Organizations count summary -->
    <div class="px-4 py-3 bg-gray-50 text-gray-600 text-sm rounded-b-lg border-t border-gray-200">
      Showing <span class="font-medium">{filteredOrganizations.length}</span> of <span class="font-medium">{organizations.length}</span> organizations
    </div>
  </div>

  <!-- Organizations Table -->
  <div class="mt-6">
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button 
                  class="group inline-flex items-center focus:outline-none" 
                  on:click={() => sort('name')}
                >
                  Organization
                  {#if sortField === 'name'}
                    <svg class="ml-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              </th>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button 
                  class="group inline-flex items-center focus:outline-none" 
                  on:click={() => sort('salesStage')}
                >
                  Sales Pipeline
                  {#if sortField === 'salesStage'}
                    <svg class="ml-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              </th>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button 
                  class="group inline-flex items-center focus:outline-none" 
                  on:click={() => sort('priority')}
                >
                  Priority
                  {#if sortField === 'priority'}
                    <svg class="ml-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              </th>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Assigned To</th>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button 
                  class="group inline-flex items-center focus:outline-none" 
                  on:click={() => sort('lastContactDate')}
                >
                  Last Activity
                  {#if sortField === 'lastContactDate'}
                    <svg class="ml-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              </th>
              <th scope="col" class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button 
                  class="group inline-flex items-center focus:outline-none" 
                  on:click={() => sort('nextFollowUpDate')}
                >
                  Next Follow-up
                  {#if sortField === 'nextFollowUpDate'}
                    <svg class="ml-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            {#each filteredOrganizations as org}
              <tr 
                class="cursor-pointer hover:bg-gray-50 transition duration-150 group"
                on:click={() => handleRowClick(org.organizationId)}
              >
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition">{org.name}</div>
                      {#if org.priority === 'HIGH'}
                        <span class="ml-2 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                      {/if}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {#if org.website}
                        <a href="{org.website}" target="_blank" class="text-indigo-600 hover:underline" on:click|stopPropagation>
                          {org.website.replace(/^https?:\/\//i, '')}
                        </a>
                      {:else}
                        <span class="text-gray-400">No website</span>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex flex-col space-y-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getSalesStageClass(org.salesStage)}">
                      {org.salesStage.replace('_', ' ')}
                    </span>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-indigo-600 h-2 rounded-full" style="width: {getSalesStageProgress(org.salesStage)}%"></div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPriorityClass(org.priority)}">
                    {org.priority}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {#if org.assignedTo}
                      <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                        {org.assignedTo.username[0].toUpperCase()}
                      </div>
                      <div class="ml-2 text-sm text-gray-900">{org.assignedTo.username}</div>
                    {:else}
                      <span class="text-gray-400">Unassigned</span>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    {#if org.lastContactDate}
                      <div class="text-sm text-gray-900">{formatDate(org.lastContactDate)}</div>
                      <div class="flex items-center mt-1">
                        <span class="h-2 w-2 rounded-full {getContactUrgency(org) === 'high' ? 'bg-red-400' : getContactUrgency(org) === 'medium' ? 'bg-yellow-400' : 'bg-green-400'} mr-2"></span>
                        <span class="text-xs text-gray-500">{getTimeSince(org.lastContactDate)}</span>
                      </div>
                    {:else}
                      <span class="text-gray-400">Never contacted</span>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  {#if org.nextFollowUpDate}
                    <div class="flex flex-col">
                      <div class="{isFollowUpDue(org.nextFollowUpDate) ? 'text-red-600 font-medium' : 'text-gray-900'}">
                        {formatDate(org.nextFollowUpDate)}
                      </div>
                      {#if isFollowUpDue(org.nextFollowUpDate)}
                        <div class="text-xs text-red-500 mt-1">
                          Due today
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-gray-400">Not scheduled</span>
                  {/if}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p class="text-gray-900 font-medium">No organizations found</p>
                    <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                    <button
                      type="button"
                      class="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      on:click={clearFilters}
                    >
                      Clear all filters
                    </button>
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