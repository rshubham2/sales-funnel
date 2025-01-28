<!-- src/routes/sales/pipeline/[orgId]/negotiation/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    followUp: {
      date: '',
      status: '',
      notes: '',
      nextSteps: ''
    }
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Negotiation Stage</h2>

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Follow-up Date</label>
      <input
        type="date"
        name="followUpDate"
        bind:value={formData.followUp.date}
        class="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Negotiation Status</label>
      <select
        name="status"
        bind:value={formData.followUp.status}
        class="w-full p-2 border rounded"
      >
        <option value="inProgress">In Progress</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Notes</label>
      <textarea
        name="notes"
        bind:value={formData.followUp.notes}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Next Steps</label>
      <textarea
        name="nextSteps"
        bind:value={formData.followUp.nextSteps}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save Negotiation Details
    </button>
  </form>
</div>