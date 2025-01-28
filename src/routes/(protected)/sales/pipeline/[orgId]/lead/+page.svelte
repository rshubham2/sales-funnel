<!-- src/routes/sales/pipeline/[orgId]/lead/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    vertical: '',
    totalLocations: 0,
    businessExpectationsCount: 0,
    businessExpectationsValue: 0,
    businessExpectationsMRR: 0,
    category: '',
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Lead Information</h2>
  
  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Business Vertical</label>
      <input
        type="text"
        name="vertical"
        bind:value={formData.vertical}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Total Locations</label>
      <input
        type="number"
        name="totalLocations"
        bind:value={formData.totalLocations}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Business Expectations (Count)</label>
        <input
          type="number"
          name="businessExpectationsCount"
          bind:value={formData.businessExpectationsCount}
          class="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Business Expectations (Value)</label>
        <input
          type="number"
          name="businessExpectationsValue"
          bind:value={formData.businessExpectationsValue}
          class="w-full p-2 border rounded"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Monthly Recurring Revenue (MRR)</label>
      <input
        type="number"
        name="businessExpectationsMRR"
        bind:value={formData.businessExpectationsMRR}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Category</label>
      <input
        type="text"
        name="category"
        bind:value={formData.category}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save Lead Information
    </button>
  </form>
</div>