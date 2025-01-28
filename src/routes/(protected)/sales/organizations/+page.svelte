<!-- src/routes/sales/organizations/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  export let data: PageData;

  console.log(data);
  

  let isAssigning = false;
  let assignError: string | null = null;
  let assignSuccess = false;

  // Function to get status color classes
  function getStatusClasses(stage: string) {
    const colors = {
      PROSPECT: 'bg-gray-100 text-gray-800',
      LEAD: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-yellow-100 text-yellow-800',
      PRESENTATION: 'bg-orange-100 text-orange-800',
      POC: 'bg-purple-100 text-purple-800',
      PROPOSAL: 'bg-indigo-100 text-indigo-800',
      NEGOTIATION: 'bg-pink-100 text-pink-800',
      ORDER: 'bg-green-100 text-green-800',
      CLOSED_WON: 'bg-emerald-100 text-emerald-800',
      CLOSED_LOST: 'bg-red-100 text-red-800'
    };
    
    return colors[stage] || 'bg-gray-100 text-gray-800';
  }

  function getPriorityClasses(priority: string) {
    return {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    }[priority] || 'bg-gray-100 text-gray-800';
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Organizations</h1>

  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
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
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.organizations as org}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{org.name}</div>
                <div class="text-sm text-gray-500">{org.website}</div>
              </td>
              <td class="px-6 py-4">
                {#if org.contacts && org.contacts.length > 0}
                  <div class="text-sm font-medium text-gray-900">
                    {org.contacts[0].name}
                  </div>
                  <div class="text-sm text-gray-500">
                    {org.contacts[0].email}
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusClasses(org.salesStage)}">
                  {org.salesStage}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getPriorityClasses(org.priority)}">
                  {org.priority}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {#if org.assignedTo}
                  {org.assignedTo.username}
                {:else}
                  <span class="text-gray-400">Unassigned</span>
                {/if}
              </td>
              <td class="px-6 py-4">
                {#if !org.assignedTo}
                  <form
                    method="POST"
                    action="?/assignOrganization"
                    use:enhance={() => {
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
                    }}
                  >
                    <input type="hidden" name="organizationId" value={org.organizationId} />
                    <button 
                      type="submit" 
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={isAssigning}
                    >
                      {isAssigning ? 'Assigning...' : 'Assign to Me'}
                    </button>
                  </form>
                {:else if org.assignedTo?.id === data.user?.id}
                  <a 
                    href="/sales/pipeline/{org.organizationId}"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Pipeline
                  </a>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  {#if assignError}
    <div class="mt-4 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {assignError}
          </h3>
        </div>
      </div>
    </div>
  {/if}

  {#if assignSuccess}
    <div class="mt-4 rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">
            Organization assigned successfully!
          </h3>
        </div>
      </div>
    </div>
  {/if}
</div>