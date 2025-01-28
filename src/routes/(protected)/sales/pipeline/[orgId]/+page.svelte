<!-- src/routes/sales/pipeline/[orgId]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  export let data;

  const stages = [
    { id: 'lead', name: 'Lead Information' },
    { id: 'qualification', name: 'Qualification' },
    { id: 'presentation', name: 'Presentation' },
    { id: 'poc', name: 'POC' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'order', name: 'Order' }
  ];
</script>

<div class="container mx-auto p-4">
  <div class="mb-6">
    <h1 class="text-2xl font-bold">{data.user?.assignedOrganizations[0].name}</h1>
    <p class="text-gray-600">Current Stage: {data.user?.assignedOrganizations[0].salesStage}</p>
  </div>

  <div class="flex space-x-4 mb-6">
    {#each stages as stage}
      
      <a  href="/sales/pipeline/{data.user?.assignedOrganizations[0].organizationId}/{stage.id}"
        class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        {stage.name}
      </a>
    {/each}
  </div>
</div>