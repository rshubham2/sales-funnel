<!-- src/routes/sales/pipeline/[orgId]/qualification/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    isQualified: 'no',
    customerPain: '',
    authority: '',
    consequence: '',
    isTargetProfile: 'no',
    targetProfileReason: '',
    isTimingCorrect: 'no',
    timingReason: '',
    agreedForPresentation: 'no',
    qualificationDate: '',
    remark: '',
    followupDate: ''
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Qualification Stage</h2>

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Is Qualified?</label>
      <select
        name="isQualified"
        bind:value={formData.isQualified}
        class="w-full p-2 border rounded"
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Customer Pain Points</label>
      <textarea
        name="customerPain"
        bind:value={formData.customerPain}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Authority</label>
      <input
        type="text"
        name="authority"
        bind:value={formData.authority}
        class="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Consequence</label>
      <textarea
        name="consequence"
        bind:value={formData.consequence}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Qualification Date</label>
        <input
          type="date"
          name="qualificationDate"
          bind:value={formData.qualificationDate}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Follow-up Date</label>
        <input
          type="date"
          name="followupDate"
          bind:value={formData.followupDate}
          class="w-full p-2 border rounded"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Remarks</label>
      <textarea
        name="remark"
        bind:value={formData.remark}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save Qualification
    </button>
  </form>
</div>