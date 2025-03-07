<!-- src/routes/sales/organizations/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { goto, invalidateAll } from '$app/navigation';
  import { Search, ChevronDown, Filter, Users, Building, ArrowRight, Edit2, User } from 'lucide-svelte';

  export let data: PageData;

  let selectedAssigneeId: string | null = null;

  let isUpdatingPriorities = false;
  let bulkPriorityValue: string | null = null;

  let searchTerm = '';
  let selectedStage: string | null = null;
  let selectedPriority: string | null = null;
  let isAssigning = false;
  let assignError: string | null = null;
  let assignSuccess = false;
  let assignmentFilter: 'ALL' | 'ASSIGNED' | 'UNASSIGNED' = 'UNASSIGNED';
  let editingPriority: string | null = null;
  let selectedOrganizations: Set<string> = new Set();
  let isAllSelected = false;
  let showBulkActions = false;
  let currentPage = 1;
  let itemsPerPage = 10;
  let newPriorityValue: string | null = null;
  let isUpdatingPriority = false;

  // Add bulk selection functionality
  function toggleSelectAll() {
    if (isAllSelected) {
      selectedOrganizations.clear();
    } else {
      filteredOrganizations.forEach(org => {
        selectedOrganizations.add(org.organizationId);
      });
    }
    selectedOrganizations = selectedOrganizations;
    isAllSelected = !isAllSelected;
    showBulkActions = selectedOrganizations.size > 0;
  }

  function toggleSelectOrganization(orgId: string) {
    if (selectedOrganizations.has(orgId)) {
      selectedOrganizations.delete(orgId);
    } else {
      selectedOrganizations.add(orgId);
    }
    selectedOrganizations = selectedOrganizations;
    showBulkActions = selectedOrganizations.size > 0;
    isAllSelected = selectedOrganizations.size === filteredOrganizations.length;
  }

  async function handlePriorityUpdate(organizationId: string, newPriority: string) {
    if (!newPriority) return;
    
    isUpdatingPriority = true;
    
    try {
      const response = await fetch(`/api/organizations/${organizationId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      if (!response.ok) throw new Error('Failed to update priority');
      
      // Optimistic update
      data.organizations = data.organizations.map(org => {
        if (org.organizationId === organizationId) {
          return { ...org, priority: newPriority };
        }
        return org;
      });
      
      assignSuccess = true;
      setTimeout(() => assignSuccess = false, 3000);
    } catch (error) {
      console.error('Error updating priority:', error);
      assignError = 'Failed to update priority';
      setTimeout(() => assignError = null, 3000);
    } finally {
      isUpdatingPriority = false;
      editingPriority = null;
      newPriorityValue = null;
    }
  }

  // Computed properties
  $: filteredOrganizations = data.organizations.filter((org) => {
    const matchesSearch = !searchTerm || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contacts?.[0]?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = !selectedStage || org.salesStage === selectedStage;
    const matchesPriority = !selectedPriority || org.priority === selectedPriority;
    const matchesAssignment = assignmentFilter === 'ALL' || 
      (assignmentFilter === 'ASSIGNED' && org.assignedTo) || 
      (assignmentFilter === 'UNASSIGNED' && !org.assignedTo);

    return matchesSearch && matchesStage && matchesPriority && matchesAssignment;
  });

  $: paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  $: totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  $: totalOrgs = filteredOrganizations.length;
  $: assignedOrgs = filteredOrganizations.filter(org => org.assignedTo).length;
  $: unassignedOrgs = totalOrgs - assignedOrgs;

  const stages = ['PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 'POC', 'PROPOSAL', 'NEGOTIATION', 'ORDER'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];

  function getStatusClasses(stage: string): string {
    const colors = {
      PROSPECT: 'bg-slate-100 text-slate-700 ring-slate-500/10',
      LEAD: 'bg-blue-50 text-blue-700 ring-blue-600/10',
      QUALIFICATION: 'bg-amber-50 text-amber-700 ring-amber-600/10',
      PRESENTATION: 'bg-orange-50 text-orange-700 ring-orange-600/10',
      POC: 'bg-purple-50 text-purple-700 ring-purple-600/10',
      PROPOSAL: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10',
      NEGOTIATION: 'bg-pink-50 text-pink-700 ring-pink-600/10',
      ORDER: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
    };
    return `${colors[stage]} ring-1`;
  }

  function getPriorityClasses(priority: string): string {
    const classes = {
      HIGH: 'bg-red-50 text-red-700 ring-red-600/10',
      MEDIUM: 'bg-yellow-50 text-yellow-700 ring-yellow-600/10',
      LOW: 'bg-green-50 text-green-700 ring-green-600/10'
    };
    return `${classes[priority]} ring-1`;
  }

  async function handleBulkAssign() {
    if (selectedOrganizations.size === 0) return;
    
    isAssigning = true;
    assignError = null;
    assignSuccess = false;
    
    try {
      const formData = new FormData();
      formData.append('organizationIds', JSON.stringify(Array.from(selectedOrganizations)));
      
      if (data.user?.role === 'ADMIN' && selectedAssigneeId) {
        formData.append('assignToUserId', selectedAssigneeId);
      }

      const response = await fetch('?/bulkAssign', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to assign organizations');
      }

      assignSuccess = true;
      selectedOrganizations.clear();
      showBulkActions = false;
      selectedAssigneeId = null;

      // Refresh the data
      await invalidateAll();
      
    } catch (error) {
      console.error('Bulk assign error:', error);
      assignError = error.message || 'Failed to assign organizations';
    } finally {
      isAssigning = false;
      setTimeout(() => {
        assignSuccess = false;
        assignError = null;
      }, 3000);
    }
  }


  async function handleBulkPriorityUpdate() {
    if (selectedOrganizations.size === 0 || !bulkPriorityValue) return;
    
    isUpdatingPriorities = true;
    assignError = null;
    assignSuccess = false;
    
    try {
      const formData = new FormData();
      formData.append('organizationIds', JSON.stringify(Array.from(selectedOrganizations)));
      formData.append('priority', bulkPriorityValue);

      const response = await fetch('?/bulkUpdatePriority', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update priorities');
      }

      assignSuccess = true;
      selectedOrganizations.clear();
      showBulkActions = false;
      bulkPriorityValue = null;

      // Refresh the data
      await invalidateAll();
      
    } catch (error) {
      console.error('Bulk priority update error:', error);
      assignError = error.message || 'Failed to update priorities';
    } finally {
      isUpdatingPriorities = false;
      setTimeout(() => {
        assignSuccess = false;
        assignError = null;
      }, 3000);
    }
  }
</script>

<div class="min-h-screen bg-gray-50/80">
  <div class="max-w-[98%] mx-auto px-4 py-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center text-sm text-gray-500 mb-2">
            <a href="/sales/dashboard" class="hover:text-indigo-600 transition-colors">Sales</a>
            <ArrowRight class="h-4 w-4 mx-2" />
            <span class="text-gray-900">Organizations</span>
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Organizations</h1>
        </div>
        
        <div class="flex items-center gap-3">

          {#if showBulkActions}
  <div class="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-200">
    <span class="text-sm text-gray-600">{selectedOrganizations.size} selected</span>
    
    <div class="flex items-center gap-2">
      <!-- User Assignment -->
      {#if data.user?.role === 'ADMIN' && data.users}
        <select
          bind:value={selectedAssigneeId}
          class="text-sm border-gray-300 rounded-md"
          disabled={isAssigning || isUpdatingPriorities}
        >
          <option value="">Assign to user...</option>
          {#each data.users as user}
            <option value={user.id}>{user.username}</option>
          {/each}
        </select>

        <button
          on:click={handleBulkAssign}
          disabled={isAssigning || isUpdatingPriorities || !selectedAssigneeId}
          class="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {#if isAssigning}
            <span class="inline-block animate-spin">↻</span>
            Assigning...
          {:else}
            Assign
          {/if}
        </button>
      {/if}

            <!-- Priority Update -->
            <select
              bind:value={bulkPriorityValue}
              class="text-sm border-gray-300 rounded-md"
              disabled={isAssigning || isUpdatingPriorities}
            >
              <option value="">Update priority...</option>
              {#each priorities as priority}
                <option value={priority}>{priority}</option>
              {/each}
            </select>

            <button
              on:click={handleBulkPriorityUpdate}
              disabled={isAssigning || isUpdatingPriorities || !bulkPriorityValue}
              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {#if isUpdatingPriorities}
                <span class="inline-block animate-spin">↻</span>
                Updating...
              {:else}
                Update Priority
              {/if}
            </button>
          </div>
        </div>
      {/if}

      {#if data.user?.role == "ADMIN"}    
          <!-- <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Filter class="h-4 w-4 mr-2" />
            Export
          </button> -->
          
          <button 
          on:click={() => goto('/admin/import')}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Users class="h-4 w-4 mr-2" />
            Add Organization
          </button>
      {/if}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Organizations</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{totalOrgs}</p>
            </div>
            <Building class="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Assigned</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{assignedOrgs}</p>
            </div>
            <Users class="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Unassigned</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{unassignedOrgs}</p>
            </div>
            <Users class="h-8 w-8 text-amber-500" />
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="flex-1 min-w-[300px]">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              bind:value={searchTerm}
              placeholder="Search organizations, contacts, or addresses..."
              class="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <select
          bind:value={assignmentFilter}
          class="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
        >
          <option value="ALL">All Organizations</option>
          <option value="ASSIGNED">Assigned Only</option>
          <option value="UNASSIGNED">Unassigned Only</option>
        </select>

        <select
          bind:value={selectedStage}
          class="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
        >
          <option value={null}>All Stages</option>
          {#each stages as stage}
            <option value={stage}>{stage}</option>
          {/each}
        </select>

        <select
          bind:value={selectedPriority}
          class="px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[180px]"
        >
          <option value={null}>All Priorities</option>
          {#each priorities as priority}
            <option value={priority}>{priority}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 text-left">
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    on:change={toggleSelectAll}
                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </label>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            {#each paginatedOrganizations as org (org.organizationId)}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrganizations.has(org.organizationId)}
                      on:change={() => toggleSelectOrganization(org.organizationId)}
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </label>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">{org.name}</span>
                    <a href={org.website} target="_blank" rel="noopener noreferrer" class="text-xs text-gray-500 hover:text-indigo-600 mt-1">
                      {org.website}
                    </a>
                  </div>
                </td>
                <td class="px-6 py-4">
                  {#if org.contacts && org.contacts.length > 0}
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900">{org.contacts[0].name}</span>
                      <a href="mailto:{org.contacts[0].email}" class="text-xs text-gray-500 hover:text-indigo-600 mt-1">
                        {org.contacts[0].email}
                      </a>
                    </div>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full {getStatusClasses(org.salesStage)}">
                    {org.salesStage}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex px-2.5 py-1 text-xs font-medium rounded-full {getPriorityClasses(org.priority)}">
                      {org.priority}
                    </span>
                    {#if data.user?.role === 'ADMIN'}
                      <button
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        on:click={() => {
                          editingPriority = org.organizationId;
                          newPriorityValue = org.priority;
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4">
                  {#if org.assignedTo}
                    <div class="flex items-center gap-2">
                      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {org.assignedTo.username[0].toUpperCase()}
                      </span>
                      <span class="text-sm text-gray-900">{org.assignedTo.username}</span>
                    </div>
                  {:else}
                    <span class="text-sm font-medium text-amber-600">Unassigned</span>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    {#if !org.assignedTo}
                      <form method="POST" action="?/assignOrganization" use:enhance={() => {
                        isAssigning = true;
                        assignError = null;
                        assignSuccess = false;
                        return async ({ result, update }) => {
                          isAssigning = false;
                          if (result.type === 'success') {
                            assignSuccess = true;
                          } else if (result.type === 'failure') {
                            assignError = result.data?.message || 'Failed to assign organization';
                          }
                          await update();
                        };
                      }}>
                        <input type="hidden" name="organizationId" value={org.organizationId} />
                        <button 
                          type="submit" 
                          class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                          disabled={isAssigning}
                        >
                          <Users class="mr-1.5 h-3 w-3" />
                          {isAssigning ? 'Assigning...' : 'Assign to Me'}
                        </button>
                      </form>
                    {:else if org.assignedTo?.id === data.user?.id}
                      <a 
                        href="/sales/pipeline/{org.organizationId}"
                        class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                      >
                        Manage Pipeline
                      </a>
                    {/if}
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="8" class="px-6 py-8 text-center">
                  <div class="flex flex-col items-center">
                    <Building class="h-12 w-12 text-gray-400 mb-3" />
                    <p class="text-sm text-gray-500 mb-1">
                      {#if searchTerm || selectedStage || selectedPriority}
                        No organizations match your filters
                      {:else}
                        No organizations found
                      {/if}
                    </p>
                    <p class="text-sm text-gray-400">
                      {#if searchTerm || selectedStage || selectedPriority}
                        Try adjusting your filters
                      {:else}
                        Get started by adding a new organization
                      {/if}
                    </p>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrganizations.length)} of {filteredOrganizations.length}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
              on:click={() => currentPage--}
            >
              Previous
            </button>
            <button
              class="px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
              on:click={() => currentPage++}
            >
              Next
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Priority Update Modal -->
{#if editingPriority}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Update Priority</h3>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Select New Priority</label>
      <select
        bind:value={newPriorityValue}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        {#each priorities as priority}
          <option value={priority}>{priority}</option>
        {/each}
      </select>
    </div>
    <div class="flex justify-end gap-3">
      <button
        on:click={() => {
          editingPriority = null;
          newPriorityValue = null;
        }}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        on:click={() => handlePriorityUpdate(editingPriority, newPriorityValue)}
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Update
      </button>
    </div>
  </div>
</div>
{/if}

<!-- Toast Notifications -->
{#if assignError || assignSuccess}
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    {#if assignError}
      <div class="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-4 animate-slide-in">
        <div class="flex items-center">
          <div class="flex-shrink-0 text-red-400">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-900">{assignError}</p>
          </div>
        </div>
      </div>
    {/if}
    
    {#if assignSuccess}
      <div class="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4 animate-slide-in">
        <div class="flex items-center">
          <div class="flex-shrink-0 text-green-400">
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-gray-900">Organization updated successfully!</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Animation keyframes */
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out forwards;
  }

  /* Enhanced scrollbar styling */
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }

  /* Smooth transitions */
  button, 
  select, 
  input,
  .transition-all {
    transition: all 0.2s ease-in-out;
  }

  /* Focus states */
  button:focus-visible,
  select:focus-visible,
  input:focus-visible {
    outline: 2px solid theme('colors.indigo.500');
    outline-offset: 2px;
  }
</style>