<!-- src/routes/(protected)/admin/users/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    X, 
    ChevronDown, 
    ChevronUp,
    Users,
    Target,
    BarChart,
    DollarSign
  } from 'lucide-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  export let form;

  let searchQuery = '';
  let showAddUserModal = false;
  let showUpdateModal = false;
  let selectedUser: any = null;
  let expandedUsers = new Set();

    function openUpdateModal(user: any) {
    selectedUser = user;
    showUpdateModal = true;
  }

  function handleDelete(userId: string) {
    selectedUser = {
      ...data.users.find(u => u.id === userId),
      showDeleteConfirm: true
    };
  }

  // Toggle user details
  function toggleUserDetails(userId: string) {
    if (expandedUsers.has(userId)) {
      expandedUsers.delete(userId);
    } else {
      expandedUsers.add(userId);
    }
    expandedUsers = expandedUsers; // Trigger reactivity
  }

  // Computed filtered users
  $: filteredUsers = data.users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roles = ['ADMIN', 'SALES', 'USER'];
  const userStatus = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  function getStageColor(stage: string) {
    const colors = {
      PROSPECT: 'bg-gray-100 text-gray-800',
      LEAD: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-indigo-100 text-indigo-800',
      PRESENTATION: 'bg-purple-100 text-purple-800',
      POC: 'bg-yellow-100 text-yellow-800',
      PROPOSAL: 'bg-orange-100 text-orange-800',
      NEGOTIATION: 'bg-pink-100 text-pink-800',
      ORDER: 'bg-green-100 text-green-800',
      CLOSED_WON: 'bg-emerald-100 text-emerald-800',
      CLOSED_LOST: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }

  function getPriorityColor(priority: string) {
    return {
      HIGH: 'text-red-600',
      MEDIUM: 'text-yellow-600',
      LOW: 'text-green-600'
    }[priority] || 'text-gray-600';
  }
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
    <button
      on:click={() => showAddUserModal = true}
      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      <Plus size={20} />
      Add User
    </button>
  </div>

  <!-- Search and Filters -->
  <div class="mb-6 flex gap-4">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search users..."
        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>

  <!-- Users List -->
  <div class="space-y-4">
    {#each filteredUsers as user}
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- User Header -->
        <div 
          class="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          on:click={() => toggleUserDetails(user.id)}
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users class="text-blue-600" size={20} />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{user.name}</h3>
              <p class="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="px-3 py-1 rounded-full text-sm font-medium {
              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
              user.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }">
              {user.status}
            </span>
            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              {user.role}
            </span>
            {#if expandedUsers.has(user.id)}
              <ChevronUp size={20} class="text-gray-400" />
            {:else}
              <ChevronDown size={20} class="text-gray-400" />
            {/if}
          </div>
        </div>

        <!-- Expanded Content -->
        {#if expandedUsers.has(user.id)}
          <div class="border-t border-gray-200 p-4">
            <!-- Performance Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-blue-900">Total Assignments</h4>
                  <Target class="text-blue-600" size={20} />
                </div>
                <p class="text-2xl font-bold text-blue-900 mt-2">{user.metrics.totalAssignments}</p>
              </div>
              
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-green-900">Active Deals</h4>
                  <BarChart class="text-green-600" size={20} />
                </div>
                <p class="text-2xl font-bold text-green-900 mt-2">{user.metrics.activeDeals}</p>
              </div>
              
              <div class="bg-yellow-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-yellow-900">Total MRR</h4>
                  <DollarSign class="text-yellow-600" size={20} />
                </div>
                <p class="text-2xl font-bold text-yellow-900 mt-2">₹{user.metrics.totalMRR.toLocaleString()}</p>
              </div>
              
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-purple-900">Stage Distribution</h4>
                  <BarChart class="text-purple-600" size={20} />
                </div>
                <div class="mt-2 space-y-1">
                  {#each Object.entries(user.metrics.stageDistribution) as [stage, count]}
                    {#if count > 0}
                      <div class="flex items-center justify-between text-sm">
                        <span>{stage}</span>
                        <span class="font-medium">{count}</span>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            </div>

            <!-- Assigned Organizations -->
            {#if user.assignments.length > 0}
              <div class="mt-4">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Assigned Organizations</h4>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vertical</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRR</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {#each user.assignments as org}
                        <tr>
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {org.name}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs font-medium rounded-full {getStageColor(org.stage)}">
                              {org.stage}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {org.vertical}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span class="font-medium {getPriorityColor(org.priority)}">
                              {org.priority}
                            </span>
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            ₹{org.mrr.toLocaleString()}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {:else}
              <p class="text-gray-500 text-sm">No organizations assigned</p>
            {/if}

            <!-- Action Buttons -->
            <div class="mt-4 flex justify-end space-x-2">
              <button 
                on:click={() => openUpdateModal(user)}
                class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                <Edit size={20} />
              </button>
              <button 
                on:click={() => handleDelete(user.id)}
                class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add User Modal -->
  {#if showAddUserModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Add New User</h2>
          <button 
            on:click={() => showAddUserModal = false}
            class="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form
          method="POST"
          action="?/createUser"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                showAddUserModal = false;
                await invalidateAll();
              }
            };
          }}
          class="space-y-4"
        >
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              name="roleId"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {#each roles as role}
                <option value={role}>{role}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {#each userStatus as status}
                <option value={status}>{status}</option>
              {/each}
            </select>
          </div>

          {#if form?.error}
            <p class="text-red-600 text-sm">{form.error}</p>
          {/if}

          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              on:click={() => showAddUserModal = false}
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Update User Modal -->
  {#if showUpdateModal && selectedUser}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Update User</h2>
          <button 
            on:click={() => {
              showUpdateModal = false;
              selectedUser = null;
            }}
            class="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form
          method="POST"
          action="?/updateUser"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                showUpdateModal = false;
                selectedUser = null;
                await invalidateAll();
              }
            };
          }}
          class="space-y-4"
        >
          <input type="hidden" name="userId" value={selectedUser.id} />

          <div>
            <label for="update-username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="update-username"
              name="username"
              value={selectedUser.name}
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="update-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="update-email"
              name="email"
              value={selectedUser.email}
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="update-password" class="block text-sm font-medium text-gray-700 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="update-password"
              name="password"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="update-role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="update-role"
              name="roleId"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {#each roles as role}
                <option value={role} selected={role === selectedUser.role}>{role}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="update-status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="update-status"
              name="status"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {#each userStatus as status}
                <option value={status} selected={status === selectedUser.status}>{status}</option>
              {/each}
            </select>
          </div>

          {#if form?.error}
            <p class="text-red-600 text-sm">{form.error}</p>
          {/if}

          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              on:click={() => {
                showUpdateModal = false;
                selectedUser = null;
              }}
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if selectedUser?.showDeleteConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
        </p>

        <form
          method="POST"
          action="?/deleteUser"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                selectedUser = null;
                await invalidateAll();
              }
            };
          }}
        >
          <input type="hidden" name="userId" value={selectedUser.id} />

          <div class="flex justify-end gap-2">
            <button
              type="button"
              on:click={() => selectedUser = null}
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>