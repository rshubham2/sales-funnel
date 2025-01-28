<!-- src/routes/sales/pipeline/[orgId]/proposal/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    submissionDate: '',
    value: 0
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Proposal Stage</h2>

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Submission Date</label>
      <input
        type="date"
        name="submissionDate"
        bind:value={formData.submissionDate}
        class="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Proposal Value</label>
      <input
        type="number"
        name="value"
        bind:value={formData.value}
        class="w-full p-2 border rounded"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save Proposal
    </button>
  </form>
</div>