<!-- src/routes/sales/pipeline/[orgId]/poc/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    totalSites: 0,
    productDetail: '',
    POCDuration: '',
    POCType: '',
    businessSites: 0,
    businessValue: 0,
    MRR: 0,
    hardwareSites: 0,
    avgHardwareValue: 0,
    hardwareValue: 0,
    POCStatus: '',
    followUp: {
      date: '',
      notes: ''
    }
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">POC Stage</h2>

  <form method="POST" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Total Sites</label>
        <input
          type="number"
          name="totalSites"
          bind:value={formData.totalSites}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Business Sites</label>
        <input
          type="number"
          name="businessSites"
          bind:value={formData.businessSites}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Product Details</label>
      <textarea
        name="productDetail"
        bind:value={formData.productDetail}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">POC Duration</label>
        <input
          type="text"
          name="POCDuration"
          bind:value={formData.POCDuration}
          class="w-full p-2 border rounded"
          placeholder="e.g., 3 months"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">POC Type</label>
        <input
          type="text"
          name="POCType"
          bind:value={formData.POCType}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Business Value</label>
        <input
          type="number"
          name="businessValue"
          bind:value={formData.businessValue}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Monthly Recurring Revenue</label>
        <input
          type="number"
          name="MRR"
          bind:value={formData.MRR}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Hardware Sites</label>
        <input
          type="number"
          name="hardwareSites"
          bind:value={formData.hardwareSites}
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

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save POC Details
    </button>
  </form>
</div>