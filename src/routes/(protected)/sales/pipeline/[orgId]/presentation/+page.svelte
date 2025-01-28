<!-- src/routes/sales/pipeline/[orgId]/presentation/+page.svelte -->
<script lang="ts">
  export let data;

  let formData = {
    presentationDate: '',
    isQualified: 'no',
    decisionMakerInvolved: 'no',
    formalProposalRequested: 'no',
    budgetApproved: 'no',
    caseClosureTimeFrame: '',
    presentation: '',
    remark: '',
    followUp: {
      date: '',
      notes: ''
    },
    isPOC: 'no'
  };
</script>

<div class="max-w-2xl mx-auto p-4">
  <h2 class="text-xl font-bold mb-4">Presentation Stage</h2>

  <form method="POST" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Presentation Date</label>
        <input
          type="datetime-local"
          name="presentationDate"
          bind:value={formData.presentationDate}
          class="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Decision Maker Present?</label>
        <select
          name="decisionMakerInvolved"
          bind:value={formData.decisionMakerInvolved}
          class="w-full p-2 border rounded"
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Formal Proposal Requested?</label>
        <select
          name="formalProposalRequested"
          bind:value={formData.formalProposalRequested}
          class="w-full p-2 border rounded"
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Budget Approved?</label>
        <select
          name="budgetApproved"
          bind:value={formData.budgetApproved}
          class="w-full p-2 border rounded"
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Case Closure Timeframe</label>
      <input
        type="text"
        name="caseClosureTimeFrame"
        bind:value={formData.caseClosureTimeFrame}
        class="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Presentation Notes</label>
      <textarea
        name="presentation"
        bind:value={formData.presentation}
        class="w-full p-2 border rounded"
        rows="3"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Proceed to POC?</label>
      <select
        name="isPOC"
        bind:value={formData.isPOC}
        class="w-full p-2 border rounded"
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Save Presentation Details
    </button>
  </form>
</div>