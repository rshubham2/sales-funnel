<!-- // src/routes/sales/pipeline/[orgId]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import LeadForm from '$lib/components/stages/LeadForm.svelte';
  import QualificationForm from '$lib/components/stages/QualificationForm.svelte';
  import PresentationForm from '$lib/components/stages/PresentationForm.svelte';
  import POCForm from '$lib/components/stages/POCForm.svelte';
  import ProposalForm from '$lib/components/stages/ProposalForm.svelte';
  import NegotiationForm from '$lib/components/stages/NegotiationForm.svelte';
  import OrderForm from '$lib/components/stages/OrderForm.svelte';
  
  // Import Lucide icons
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ClipboardList from 'lucide-svelte/icons/clipboard-list';
  import CheckCircle from 'lucide-svelte/icons/check-circle';
  import Target from 'lucide-svelte/icons/target';
  import FlaskConical from 'lucide-svelte/icons/flask-conical';
  import FileText from 'lucide-svelte/icons/file-text';
  import Handshake from 'lucide-svelte/icons/handshake';
  import PackageCheck from 'lucide-svelte/icons/package-check';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Loader2 from 'lucide-svelte/icons/loader-2';
  import Check from 'lucide-svelte/icons/check';
  import Lock from 'lucide-svelte/icons/lock';
  
  export let data;
  
  const organization = data.organization;
  const availableStages = data.availableStages || [];

  // Default stages with Lucide icons
  const allStages = [
    { id: 'lead', name: 'Lead', model: 'leads', icon: ClipboardList },
    { id: 'qualification', name: 'Qualification', model: 'qualification', icon: CheckCircle },
    { id: 'presentation', name: 'Presentation', model: 'presentation', icon: Target },
    { id: 'poc', name: 'POC', model: 'POC', icon: FlaskConical },
    { id: 'proposal', name: 'Proposal', model: 'proposal', icon: FileText },
    { id: 'negotiation', name: 'Negotiation', model: 'negotiation', icon: Handshake },
    { id: 'order', name: 'Order', model: 'order', icon: PackageCheck }
  ];
  
  // Use all stages for display, but control access with availableStages
  let visibleStages = allStages;
  
  // Set initial stage based on organization's current stage if available
  let currentStage = availableStages.length > 0 ? availableStages[availableStages.length - 1] : 'lead';
  let isLoading = true;
  let stageData: Record<string, any> = {};
  
  // Add animation state
  let previousStage: string = currentStage;
  let slideDirection = 'right';

  function changeStage(stageId: string) {
    if (!isStageAccessible(stageId)) return;
    
    const currentIndex = getStageIndex(currentStage);
    const targetIndex = getStageIndex(stageId);
    
    // Only set slide direction if both indices are valid
    if (currentIndex !== -1 && targetIndex !== -1) {
      slideDirection = targetIndex > currentIndex ? 'right' : 'left';
    }
    
    previousStage = currentStage;
    currentStage = stageId;
  }

  // Safely get the stage index
  function getStageIndex(stageId: string): number {
    return visibleStages.findIndex(s => s.id === stageId);
  }
  
  function isStageAccessible(stageId: string): boolean {
    return availableStages.includes(stageId);
  }
  
  function isStageComplete(stageId: string): boolean {
    // A stage is complete if it has data and is not the current stage
    // Or if we can access stages after it
    const stageIndex = getStageIndex(stageId);
    const accessibleIndex = availableStages.indexOf(stageId);
    
    // If we can access a later stage, then this one must be complete
    if (accessibleIndex < availableStages.length - 1) return true;
    
    // Otherwise check if it has data and is not the current stage
    return stageData[stageId] !== null && stageData[stageId] !== undefined && stageId !== currentStage;
  }
  
  // Calculate progress percentage based on completed stages
  $: progressPercentage = visibleStages.length > 0 
    ? Math.round((availableStages.length / visibleStages.length) * 100) 
    : 0;
  
  // Get human-readable date format
  function formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  onMount(async () => {
    if (organization) {
      await loadStageData();
    }
    
    isLoading = false;
  });

  console.log('stagedata', stageData);
  console.log('organization', organization);
  
  async function loadStageData() {
    // This function would fetch data for each stage
    // For demonstration, we'll use what's already in the organization data
    
    for (const stage of allStages) {
      if (organization[stage.model] && organization[stage.model].length > 0) {
        stageData[stage.id] = organization[stage.model][0];
      } else {
        stageData[stage.id] = null;
      }
    }
  }
</script>

{#if isLoading}
  <div class="min-h-screen flex justify-center items-center bg-gray-50">
    <div class="text-center">
      <Loader2 class="w-8 h-8 text-blue-600 mx-auto animate-spin" />
      <p class="mt-2 text-gray-600 font-medium">Loading pipeline data...</p>
    </div>
  </div>
{:else if !organization}
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-sm">
      <div class="text-center">
        <AlertCircle class="mx-auto h-10 w-10 text-red-500" />
        <h2 class="mt-3 text-lg font-semibold text-gray-900">Organization Not Found</h2>
        <p class="mt-1 text-gray-600">We couldn't find the organization you're looking for.</p>
        <a href="/sales/organizations" class="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
          Return to Organizations
        </a>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Compact Header -->
      <header class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-gray-900">{organization.name}</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {organization.salesStage}
              </span>
            </div>
            <div class="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {#if organization.website}
                <a href={organization.website} target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 transition-colors">Website</a>
              {/if}
              {#if organization.lastContactDate}
                <span>Last Contact: {formatDate(organization.lastContactDate)}</span>
              {/if}
            </div>
          </div>
          <a 
            href="/sales/organizations" 
            class="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronLeft class="w-4 h-4 mr-1" />
            Back
          </a>
        </div>
      </header>

      <!-- Progress Indicator -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-medium text-gray-700">Pipeline Progress</span>
          <span class="text-xs font-medium text-gray-700">{progressPercentage}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-1.5">
          <div 
            class="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-out"
            style="width: {progressPercentage}%"
          ></div>
        </div>
        
        <!-- Compact Stage Navigation -->
        <div class="mt-4 flex">
          {#each visibleStages as stage, index}
            <div class="flex-1 relative {index !== 0 ? 'ml-1' : ''}">
              <!-- Connecting Line -->
              {#if index > 0}
                <div class="absolute left-0 top-4 w-full h-0.5 -ml-1">
                  <div class="h-0.5 w-full {
                    availableStages.includes(visibleStages[index-1].id) ? 'bg-blue-400' : 'bg-gray-200'
                  }"></div>
                </div>
              {/if}
              
              <button
                on:click={() => changeStage(stage.id)}
                disabled={!isStageAccessible(stage.id)}
                class="w-full text-center pt-3 pb-2 rounded transition-all relative {
                  isStageAccessible(stage.id) 
                    ? currentStage === stage.id 
                      ? 'text-blue-700' 
                      : isStageComplete(stage.id) 
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-400 cursor-not-allowed'
                }"
              >
                <div class="flex justify-center">
                  <div class="h-8 w-8 rounded-full flex items-center justify-center {
                    isStageAccessible(stage.id)
                      ? currentStage === stage.id 
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                        : isStageComplete(stage.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-50 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }">
                    {#if !isStageAccessible(stage.id)}
                      <Lock class="h-3.5 w-3.5" />
                    {:else if isStageComplete(stage.id)}
                      <Check class="h-4 w-4" />
                    {:else}
                      <svelte:component this={stage.icon} class="h-4 w-4" />
                    {/if}
                  </div>
                </div>
                <span class="text-xs font-medium mt-1 block truncate px-1">
                  {stage.name}
                </span>
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Stage Content -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="transition-all duration-300 {slideDirection === 'right' ? 'slide-right' : 'slide-left'}">
          {#if currentStage === 'lead'}
            <LeadForm 
            organizationId={organization.organizationId} 
            currentData={stageData.lead} 
            />
          {:else if currentStage === 'qualification'}
            <QualificationForm 
            organizationId={organization.organizationId} 
            currentData={stageData.qualification} 
            />
          {:else if currentStage === 'presentation'}
            <PresentationForm
              organizationId={organization.organizationId}
              currentData={stageData.presentation}
            />
          {:else if currentStage === 'poc'}
            <POCForm
              organizationId={organization.organizationId}
              currentData={stageData.poc}
            />
          {:else if currentStage === 'proposal'}
            <ProposalForm
              organizationId={organization.organizationId}
              currentData={stageData.proposal}
            />
          {:else if currentStage === 'negotiation'}
            <NegotiationForm
              organizationId={organization.organizationId}
              currentData={stageData.negotiation}
            />
          {:else if currentStage === 'order'}
            <OrderForm
              organizationId={organization.organizationId}
              currentData={stageData.order}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .slide-right {
    animation: slideRight 0.3s ease-out;
  }

  .slide-left {
    animation: slideLeft 0.3s ease-out;
  }

  @keyframes slideRight {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideLeft {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Smooth transitions */
  button, a, div {
    transition-property: color, background-color, border-color, transform, box-shadow;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
</style>