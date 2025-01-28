<!-- src/routes/sales/pipeline/[orgId]/order/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    projectStatus: '',
    finalOrderValue: 0,
    finalBusinessValue: '',
    totalHardwareSites: 0,
    avgHardwareValue: 0,
    totalHardwareValue: 0,
    lossReason: ''
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Order Stage</h2>

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Project Status</label>
      <select
        name="projectStatus"
        bind:value={formData.projectStatus}
        class="w-full p-2 border rounded"
      >
        <option value="CLOSED_WON">Closed Won</option>
        <option value="CLOSED_LOST">Closed Lost</option>
      </select>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Final Order Value</label>
        <input
          type="number"
          name="finalOrderValue"
          bind:value={formData.finalOrderValue}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Final Business Value</label>
        <input
          type="text"
          name="finalBusinessValue"
          bind:value={formData.finalBusinessValue}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Total Hardware Sites</label>
        <input
          type="number"
          name="totalHardwareSites"
          bind:value={formData.totalHardwareSites}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Average Hardware Value</label>
        <input
          type="number"
          name="avgHardwareValue"
          bind:value={formData.avgHardwareValue}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Total Hardware Value</label>
      <input
        type="number"
        name="totalHardwareValue"
        bind:value={formData.totalHardwareValue}
        class="w-full p-2 border rounded"
      />
    </div>

    {#if formData.projectStatus === 'CLOSED_LOST'}
      <div>
        <label class="block text-sm font-medium mb-1">Loss Reason</label>
        <textarea
          name="lossReason"
          bind:value={formData.lossReason}
          class="w-full p-2 border rounded"
          rows="3"
        />
      </div>
    {/if}

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Submit Order Details
    </button>
  </form>
</div>