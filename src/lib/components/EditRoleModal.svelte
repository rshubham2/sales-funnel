<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { X } from 'lucide-svelte';
import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let user;
  export let roles = [
    { id: 1, name: 'USER' },
    { id: 2, name: 'ADMIN' }
  ];


</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-6 w-full max-w-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Edit User Role</h2>
      <button on:click={() => dispatch('close')} class="text-gray-500 hover:text-gray-700">
        <X size={24} />
      </button>
    </div>

    <form
      action="?/updateRole"
      method="POST"
      use:enhance={() => {
        return async ({ result }) => {
          await invalidateAll();
          if (result.type === 'success') {
            dispatch('close');
          }
        };
      }}
      class="space-y-4"
    >
      <input type="hidden" name="userId" value={user.id} />
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          value={user.username}
          disabled
          class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          name="roleId"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={user.roleId}
        >
          {#each roles as role}
            <option value={role.id}>{role.name}</option>
          {/each}
        </select>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          on:click={() => dispatch('close')}
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
</div>

