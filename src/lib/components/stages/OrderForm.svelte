<!-- src/lib/components/stages/OrderForm.svelte -->
<script lang="ts">
  export let organizationId: string;
  export let currentData: any = {};
  
  let formData = {
    id: currentData?.id || undefined,
    projectStatus: currentData?.projectStatus || 'CLOSED_WON',
    finalOrderValue: currentData?.finalOrderValue || 0,
    finalBusinessValue: currentData?.finalBusinessValue || '',
    totalHardwareSites: currentData?.totalHardwareSites || 0,
    avgHardwareValue: currentData?.avgHardwareValue || 0,
    totalHardwareValue: currentData?.totalHardwareValue || 0,
    lossReason: currentData?.lossReason || ''
  };

  let isSubmitting = false;
  let error = '';
  let success = '';

  // Calculate total hardware value when sites or avg value changes
  $: formData.totalHardwareValue = 
    formData.totalHardwareSites * formData.avgHardwareValue;

  async function handleSubmit() {
    try {
      isSubmitting = true;
      error = '';
      success = '';

      // Validation
      if (formData.projectStatus === 'CLOSED_LOST' && !formData.lossReason) {
        throw new Error('Loss reason is required when status is Closed Lost');
      }

      const response = await fetch(`/api/sales/order/${organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save order data');
      }

      success = 'Order information saved successfully';
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Order Stage</h2>

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
      <label class="block text-sm font-medium mb-1" for="projectStatus">
        Project Status *
      </label>
      <select
        id="projectStatus"
        required
        bind:value={formData.projectStatus}
        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="CLOSED_WON">Closed Won</option>
        <option value="CLOSED_LOST">Closed Lost</option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1" for="finalOrderValue">
          Final Order Value *
        </label>
        <input
          id="finalOrderValue"
          type="number"
          required
          min="0"
          step="0.01"
          bind:value={formData.finalOrderValue}
          class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" for="finalBusinessValue">
          Final Business Value
        </label>
        <input
          id="finalBusinessValue"
          type="text"
          bind:value={formData.finalBusinessValue}
          class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1" for="totalHardwareSites">
          Total Hardware Sites *
        </label>
        <input
          id="totalHardwareSites"
          type="number"
          required
          min="0"
          bind:value={formData.totalHardwareSites}
          class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1" for="avgHardwareValue">
          Average Hardware Value *
        </label>
        <input
          id="avgHardwareValue"
          type="number"
          required
          min="0"
          step="0.01"
          bind:value={formData.avgHardwareValue}
          class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="totalHardwareValue">
        Total Hardware Value
      </label>
      <input
        id="totalHardwareValue"
        type="number"
        readonly
        bind:value={formData.totalHardwareValue}
        class="w-full p-2 border rounded bg-gray-50"
      />
    </div>

    {#if formData.projectStatus === 'CLOSED_LOST'}
      <div>
        <label class="block text-sm font-medium mb-1" for="lossReason">
          Loss Reason *
        </label>
        <textarea
          id="lossReason"
          required
          bind:value={formData.lossReason}
          class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />
      </div>
    {/if}

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : 'Submit Order Details'}
    </button>
  </form>
</div>