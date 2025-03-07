<!-- src/lib/components/Toast.svelte -->
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { toasts, type Toast } from '$lib/stores/toast2';
</script>

{#if $toasts.length > 0}
  <div class="fixed top-4 right-4 space-y-4 z-50">
    {#each $toasts as toast (toast.id)}
      <div
        class="flex items-center gap-2 p-4 rounded-lg shadow-lg max-w-md"
        class:bg-green-50={toast.type === 'success'}
        class:bg-red-50={toast.type === 'error'}
        class:text-green-600={toast.type === 'success'}
        class:text-red-600={toast.type === 'error'}
        in:fly={{ x: 200, duration: 300 }}
        out:fade
      >
        {#if toast.type === 'success'}
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        {:else}
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        {/if}
        <p class="text-sm flex-1">{toast.message}</p>
        <button
          on:click={() => toasts.remove(toast.id)}
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}