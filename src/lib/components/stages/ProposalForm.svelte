<!-- src/lib/components/stages/ProposalForm.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  export let organizationId: string;
  export let currentData: any = {};
  
  let formData = {
    id: currentData?.id || undefined,
    submissionDate: currentData?.submissionDate 
      ? new Date(currentData.submissionDate).toISOString().split('T')[0] 
      : '',
    value: currentData?.value || 0
  };

  let isSubmitting = false;
  let error = '';
  let success = '';

  async function handleSubmit() {
    try {
      isSubmitting = true;
      error = '';
      success = '';

      const response = await fetch(`/api/sales/proposal/${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save proposal data');
      }

      success = 'Proposal information saved successfully';
      
      // Optional: Refresh the page or update the UI
      // window.location.reload();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Proposal Stage</h2>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {success}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1" for="submissionDate">
        Submission Date *
      </label>
      <input
        id="submissionDate"
        type="date"
        required
        bind:value={formData.submissionDate}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="value">
        Proposal Value *
      </label>
      <input
        id="value"
        type="number"
        required
        min="0"
        step="0.01"
        bind:value={formData.value}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : 'Save Proposal'}
    </button>
  </form>
</div>