<!-- src/routes/admin/users/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
    import { 
    ChevronDown, 
    Building,
    X,
    Target, 
    UserCheck,
    Presentation,
    FileCheck,
    HandshakeIcon,
    ShoppingCart,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Award,
    ChartPie,
    Users,

	Globe,

	MapPin,

	FolderIcon



  } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';
  import { toasts } from '$lib/stores/toast';
  import { invalidateAll } from '$app/navigation';

  let showOrgModal = false;
  let selectedUserOrgs: any = null;
  let selectedUsername = '';

  function getStageBackgroundColor(stage: string): string {
  switch (stage.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-500';
    case 'PENDING':
      return 'bg-yellow-500';
    case 'INACTIVE':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
}

// function getPriorityStyles(priority: string): string {
//   switch (priority.toUpperCase()) {
//     case 'HIGH':
//       return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
//     case 'MEDIUM':
//       return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
//     case 'LOW':
//       return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
//     default:
//       return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
//   }
// }

function getStageBgColor(stage: string): string {
  switch (stage.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500';
    case 'PENDING':
      return 'bg-amber-500';
    case 'INACTIVE':
      return 'bg-gray-400';
    default:
      return 'bg-blue-500';
  }
}

function getPriorityStyles(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100';
  }
}

function getPriorityDot(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'LOW':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
}

  const stageIcons = {
    PROSPECT: Target,
    LEAD: UserCheck,
    QUALIFICATION: UserCheck,
    PRESENTATION: Presentation,
    POC: FileCheck,
    PROPOSAL: FileCheck,
    NEGOTIATION: HandshakeIcon,
    ORDER: ShoppingCart,
    CLOSED_WON: CheckCircle,
    CLOSED_LOST: XCircle
  };
  
  export let data;

  function openOrgDetails(user: any) {
    selectedUserOrgs = groupOrganizationsByStage(user.assignedOrganizations);
    selectedUsername = user.username;
    showOrgModal = true;
  }

  function getStageColor(stage: any) {
    const colors = {
      PROSPECT: 'bg-gray-100 text-gray-800',
      LEAD: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-indigo-100 text-indigo-800',
      PRESENTATION: 'bg-purple-100 text-purple-800',
      POC: 'bg-pink-100 text-pink-800',
      PROPOSAL: 'bg-orange-100 text-orange-800',
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      ORDER: 'bg-green-100 text-green-800',
      CLOSED_WON: 'bg-emerald-100 text-emerald-800',
      CLOSED_LOST: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }
  
  let showDeleteConfirm = false;
  let showRoleUpdateConfirm = false;
  let selectedUserId: string | null = null;
  let selectedUserForRole: { id: string, newRoleId: number } | null = null;
  let searchQuery = '';
  let sortField = 'username';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let expandedUser: string | null = null;
  
  $: filteredUsers = data.users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

    function toggleSort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }

  $: sortedUsers = [...filteredUsers].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    const statsA = calculateUserStats(a);
    const statsB = calculateUserStats(b);

    switch (sortField) {
      case 'username':
        return a.username.localeCompare(b.username) * modifier;
      case 'role':
        return a.role.name.localeCompare(b.role.name) * modifier;
      case 'winRate':
        return (Number(statsA.winRate) - Number(statsB.winRate)) * modifier;
      case 'organizations':
        return (statsA.totalOrgs - statsB.totalOrgs) * modifier;
      default:
        return 0;
    }
  });

  function toggleOrganizationDetails(userId: string) {
    expandedUser = expandedUser === userId ? null : userId;
  }

  function groupOrganizationsByStage(organizations: any[]) {
    return organizations.reduce((acc, org) => {
      const stage = org.salesStage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(org);
      return acc;
    }, {});
  }

  $: users = data.users;
  
  console.log(data);

  function confirmRoleUpdate(userId: string, newRoleId: number) {
    selectedUserForRole = { id: userId, newRoleId };
    showRoleUpdateConfirm = true;
  }

  function getOrganizationSummary(organizations: any[]) {
    const stageCounts = organizations.reduce((acc, org) => {
      acc[org.salesStage] = (acc[org.salesStage] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stageCounts)
      .map(([stage, count]) => `${stage}: ${count}`)
      .join(' | ');
  }

    async function handleFormSubmission(type: 'delete' | 'updateRole', userId: string, data?: any) {
    // Optimistic UI update
    if (type === 'delete') {
      users = users.filter(u => u.id !== userId);
    } else if (type === 'updateRole') {
      users = users.map(u => 
        u.id === userId 
          ? { ...u, role: { ...u.role, id: data.roleId } }
          : u
      );
    }

    // Close modals
    showDeleteConfirm = false;
    showRoleUpdateConfirm = false;

    // Show success toast
    toasts.success(`User successfully ${type === 'delete' ? 'deleted' : 'updated'}`);
  }


  function calculateUserStats(user: any) {
    const orgs = user.assignedOrganizations;
    const totalOrgs = orgs.length;
    const closedWon = orgs.filter(org => org.salesStage === 'CLOSED_WON').length;
    const closedLost = orgs.filter(org => org.salesStage === 'CLOSED_LOST').length;
    const active = totalOrgs - closedWon - closedLost;
    const winRate = totalOrgs ? (closedWon / totalOrgs * 100).toFixed(1) : 0;

    return { totalOrgs, closedWon, closedLost, active, winRate };
  }

    const statsItems = [
    { icon: Users, label: 'Total Users', value: data.users.length, color: 'bg-blue-100 text-blue-600' },
    { icon: Building, label: 'Active Organizations', value: data.users.reduce((acc, user) => acc + calculateUserStats(user).active, 0), color: 'bg-green-100 text-green-600' },
    { icon: Award, label: 'Average Win Rate', value: `${(data.users.reduce((acc, user) => acc + Number(calculateUserStats(user).winRate), 0) / data.users.length).toFixed(1)}%`, color: 'bg-purple-100 text-purple-600' },
    { icon: ChartPie, label: 'Total Deals Closed', value: data.users.reduce((acc, user) => acc + calculateUserStats(user).closedWon + calculateUserStats(user).closedLost, 0), color: 'bg-orange-100 text-orange-600' }
  ];

  function confirmDelete(userId: string) {
    selectedUserId = userId;
    showDeleteConfirm = true;
  }

    async function handleDeleteSuccess() {
    showDeleteConfirm = false;
    // Optionally refresh the data or show a success message
  }

  async function handleRoleUpdateSuccess() {
    showRoleUpdateConfirm = false;
    // Optionally refresh the data or show a success message
  }
</script>

<!-- Toast Notifications Component -->
<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $toasts as toast (toast.id)}
    <div
      class="px-4 py-2 rounded-lg shadow-lg text-white {toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}"
      transition:slide
    >
      {toast.message}
    </div>
  {/each}
</div>

<div class="p-6 max-w-7xl mx-auto">
  <!-- Header Section -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
    <p class="text-gray-600 mt-2">Manage users and their roles across the platform</p>
  </div>

  <!-- Stats Overview -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {#each statsItems as item}
    <div class="p-6 rounded-xl {item.color} shadow-sm" in:fade>
      <div class="flex items-center gap-4">
        <svelte:component this={item.icon} class="w-8 h-8" />
        <div>
          <div class="text-2xl font-bold">{item.value}</div>
          <div class="text-sm opacity-75">{item.label}</div>
        </div>
      </div>
    </div>
  {/each}
</div>

  <!-- Search Bar -->
  <div class="mb-6">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search users..."
      class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <!-- Users Table -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizations</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Details</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredUsers as user (user.id)}
          {@const stats = calculateUserStats(user)}
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-gray-600 font-medium">{user.username[0].toUpperCase()}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{user.username}</div>
                  <div class="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <select
                on:change={(e) => confirmRoleUpdate(user.id, parseInt(e.target.value))}
                class="text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={user.role.id}
              >
                {#each data.roles as role}
                  <option value={role.id}>{role.name}</option>
                {/each}
              </select>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">Win Rate: {stats.winRate}%</div>
              <div class="text-xs text-gray-500">
                Won: {stats.closedWon} | Lost: {stats.closedLost}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{stats.totalOrgs} Organizations</div>
              <div class="text-xs text-gray-500">{stats.active} Active</div>
            </td>
            <td class="px-6 py-4">
              <button
                on:click={() => confirmDelete(user.id)}
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>

            <td class="px-6 py-4">
            <button
              on:click={() => openOrgDetails(user)}
              class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Building class="w-4 h-4" />
              {user.assignedOrganizations.length} Organizations
              <ChevronDown class="w-4 h-4" />
            </button>
          </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- Organization Details Modal -->
{#if showOrgModal}
  <div
    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6"
    transition:fade={{ duration: 150 }}
  >
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
      transition:slide={{ duration: 200 }}
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-800">
              {selectedUsername}'s Organizations
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {Object.values(selectedUserOrgs).flat().length} organizations
            </p>
          </div>
          <button
            on:click={() => showOrgModal = false}
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="flex-1 overflow-auto px-6 py-4">
        {#if Object.values(selectedUserOrgs).flat().length === 0}
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="bg-gray-50 p-4 rounded-full mb-4">
              <FolderIcon class="w-10 h-10 text-gray-400" />
            </div>
            <h4 class="text-gray-700 font-medium mb-1">No Organizations Found</h4>
            <p class="text-gray-500 text-sm">Organizations added will appear here</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each Object.entries(selectedUserOrgs) as [stage, orgs]}
              <div class="bg-white rounded-xl border shadow-sm">
                <div class="px-4 py-3 bg-gray-50 rounded-t-xl border-b">
                  <div class="flex items-center gap-3">
                    <div class={`p-1.5 rounded-lg ${getStageBgColor(stage)}`}>
                      <svelte:component this={stageIcons[stage]} class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium text-gray-800">{stage}</h4>
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-600 shadow-sm border">
                        {orgs.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="divide-y">
                  {#each orgs as org}
                    <div class="p-4 hover:bg-gray-50/50 transition-colors">
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <h5 class="font-medium text-gray-800">{org.name}</h5>
                          {#if org.priority}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              {getPriorityStyles(org.priority)}">
                              <span class="w-1.5 h-1.5 rounded-full mr-1.5 {getPriorityDot(org.priority)}"></span>
                              {org.priority}
                            </span>
                          {/if}
                        </div>
                        
                        <div class="grid sm:grid-cols-2 gap-2">
                          {#if org.website}
                            <a 
                              href={org.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 group"
                            >
                              <Globe class="w-4 h-4 group-hover:text-blue-500" />
                              <span class="truncate">{org.website}</span>
                            </a>
                          {/if}
                          {#if org.address}
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin class="w-4 h-4 text-gray-400" />
                              <span class="truncate">{org.address}</span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t">
        <button
          on:click={() => showOrgModal = false}
          class="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" in:fade>
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" in:slide>
      <div class="flex items-center gap-3 mb-4">
        <AlertTriangle class="text-red-500" />
        <h3 class="text-lg font-medium">Confirm Delete</h3>
      </div>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
      <div class="flex justify-end gap-4">
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          on:click={() => showDeleteConfirm = false}
        >
          Cancel
        </button>
        <form 
          method="POST" 
          action="?/deleteUser" 
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                await handleFormSubmission('delete', selectedUserId);
                await invalidateAll();
              } else {
                toasts.error('Failed to delete user');
              }
            };
          }}
        >
          <input type="hidden" name="userId" value={selectedUserId} />
          <button
            type="submit"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Role Update Confirmation Modal -->
{#if showRoleUpdateConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" in:fade>
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" in:slide>
      <div class="flex items-center gap-3 mb-4">
        <AlertTriangle class="text-blue-500" />
        <h3 class="text-lg font-medium">Confirm Role Update</h3>
      </div>
      <p class="text-gray-600 mb-6">Are you sure you want to update this user's role?</p>
      <div class="flex justify-end gap-4">
        <button
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          on:click={() => showRoleUpdateConfirm = false}
        >
          Cancel
        </button>
        <form 
          method="POST" 
          action="?/updateRole" 
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                await handleFormSubmission('updateRole', selectedUserForRole.id, {
                  roleId: selectedUserForRole.newRoleId
                });
                await invalidateAll();
              } else {
                toasts.error('Failed to update role');
              }
            };
          }}
        >
          <input type="hidden" name="userId" value={selectedUserForRole?.id} />
          <input type="hidden" name="roleId" value={selectedUserForRole?.newRoleId} />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Add any additional styles here */
</style>