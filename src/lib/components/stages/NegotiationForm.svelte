<!-- src/lib/components/stages/NegotiationForm.svelte -->
<script lang="ts">
  export let organizationId: string;
  export let currentData: any = {};
  
  let formData = {
    id: currentData?.id || undefined,
    followUp: {
      date: currentData?.followUp?.date 
        ? new Date(currentData.followUp.date).toISOString().split('T')[0] 
        : '',
      status: currentData?.followUp?.status || 'inProgress',
      notes: currentData?.followUp?.notes || '',
      nextSteps: currentData?.followUp?.nextSteps || ''
    }
  };

  let isSubmitting = false;
  let error = '';
  let success = '';

  async function handleSubmit() {
    try {
      isSubmitting = true;
      error = '';
      success = '';

      const response = await fetch(`/api/sales/negotiation/${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save negotiation data');
      }

      success = 'Negotiation information saved successfully';
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Negotiation Stage</h2>

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
      <label class="block text-sm font-medium mb-1" for="followUpDate">
        Follow-up Date *
      </label>
      <input
        id="followUpDate"
        type="date"
        required
        bind:value={formData.followUp.date}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="status">
        Negotiation Status *
      </label>
      <select
        id="status"
        required
        bind:value={formData.followUp.status}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="inProgress">In Progress</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="notes">
        Notes
      </label>
      <textarea
        id="notes"
        bind:value={formData.followUp.notes}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        rows="3"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="nextSteps">
        Next Steps
      </label>
      <textarea
        id="nextSteps"
        bind:value={formData.followUp.nextSteps}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        rows="3"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : 'Save Negotiation Details'}
    </button>
  </form>
</div>