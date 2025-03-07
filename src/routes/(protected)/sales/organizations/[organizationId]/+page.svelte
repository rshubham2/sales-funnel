<!-- src/routes/organizations/[organizationId]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  export let data;
  const { organization } = data;

  function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function getStageClass(stage: string): string {
    const classes = {
      PROSPECT: 'bg-gray-100 text-gray-800',
      LEAD: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-purple-100 text-purple-800',
      PRESENTATION: 'bg-indigo-100 text-indigo-800',
      POC: 'bg-yellow-100 text-yellow-800',
      PROPOSAL: 'bg-orange-100 text-orange-800',
      NEGOTIATION: 'bg-pink-100 text-pink-800',
      ORDER: 'bg-teal-100 text-teal-800',
      CLOSED_WON: 'bg-green-100 text-green-800',
      CLOSED_LOST: 'bg-red-100 text-red-800'
    };
    return classes[stage] || 'bg-gray-100 text-gray-800';
  }


  function getYesNoClass(value: string): string {
    return value === 'yes' ? 'text-green-600' : 'text-red-600';
  }

  function formatYesNo(value: string | null | undefined): string {
    if (!value) return '-';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getStageBadge(currentStage: string, stage: string): string {
  const stageOrder = [
    'PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 
    'POC', 'PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST'
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  const stageIndex = stageOrder.indexOf(stage);
  
  if (currentStage === stage) {
    return 'bg-sky-500 text-white shadow-lg';
  } else if (stageIndex < currentIndex) {
    return 'bg-sky-400 text-white';
  } else {
    return 'bg-gray-100 text-gray-600';
  }
}

  // Determine if we have data for each stage
  const hasLeadData = organization.leads && organization.leads.length > 0;
  const hasQualificationData = organization.qualification && organization.qualification.length > 0;
  const hasPresentationData = organization.presentation && organization.presentation.length > 0;
  const hasPocData = organization.POC && organization.POC.length > 0;
  const hasProposalData = organization.proposal && organization.proposal.length > 0;
  const hasNegotiationData = organization.negotiation && organization.negotiation.length > 0;
  const hasOrderData = organization.order && organization.order.length > 0;
</script>

<div class="min-h-screen bg-gradient-to-b from-sky-50 to-white">
  <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header with breadcrumb -->
<div class="mb-8">
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white rounded-xl p-6 shadow-sm">
    <div>
      <div class="flex items-center mb-2">
        <a href="/organizations" class="text-sky-600 hover:text-sky-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Organizations
        </a>
      </div>
      <h1 class="text-3xl font-bold text-gray-900">{organization.name}</h1>
          {#if organization.website}
            <a href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
              target="_blank" rel="noopener noreferrer" 
              class="text-gray-600 hover:text-blue-600 flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {organization.website}
            </a>
          {/if}
        </div>
        <div class="mt-4 sm:mt-0">
          <div class="flex flex-col sm:items-end">
            <span class="inline-flex rounded-md px-3 py-1 text-sm font-medium leading-5 {getStageClass(organization.salesStage)}">
              {organization.salesStage.replace('_', ' ')}
            </span>
            <span class="text-sm text-gray-600 mt-1">Priority: <span class="font-medium">{organization.priority}</span></span>
          </div>
        </div>
      </div>
    </div>

<!-- Sales Pipeline Progress Visualization -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
  <div class="px-6 py-5 border-b border-gray-200">
    <h2 class="text-lg font-medium text-gray-900">Sales Pipeline Progress</h2>
  </div>
  <div class="px-6 py-5">
    <div class="flex flex-nowrap overflow-x-auto pb-2 space-x-4 md:space-x-6">
      {#each ['PROSPECT', 'LEAD', 'QUALIFICATION', 'PRESENTATION', 'POC', 'PROPOSAL', 'NEGOTIATION', 'ORDER', 'CLOSED_WON', 'CLOSED_LOST'] as stage}
        <div class="flex-shrink-0 flex flex-col items-center">
          <div class="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-300 {getStageBadge(organization.salesStage, stage)}">
            <span class="text-xs font-medium">{stage.replace('_', ' ')}</span>
          </div>
          {#if stage !== 'CLOSED_LOST' && stage !== 'CLOSED_WON' && stage !== 'ORDER'}
            <div class="h-0.5 bg-sky-200 w-8 md:w-12 mt-4 hidden md:block"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

    <!-- Primary Information Card -->
    <div class="bg-white rounded-xl shadow-sm mb-8">
      <div class="px-6 py-5 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Primary Information</h2>
      </div>
      <div class="px-6 py-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Assigned To</h3>
            {#if organization.assignedTo}
              <div class="mt-2 flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  {organization.assignedTo.username.charAt(0).toUpperCase()}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{organization.assignedTo.username}</p>
                  <p class="text-xs text-gray-500">{organization.assignedTo.email}</p>
                </div>
              </div>
            {:else}
              <p class="mt-2 text-sm text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Unassigned
              </p>
            {/if}
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Last Contact</h3>
            {#if organization.lastContactDate}
              <p class="mt-2 text-sm text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(organization.lastContactDate)}
              </p>
            {:else}
              <p class="mt-2 text-sm text-gray-500">No contact recorded</p>
            {/if}
          </div>
          
          <div>
            <h3 class="text-sm font-medium text-gray-500">Next Follow-Up</h3>
            {#if organization.nextFollowUpDate}
              <p class="mt-2 text-sm text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(organization.nextFollowUpDate)}
              </p>
            {:else}
              <p class="mt-2 text-sm text-gray-500">No follow-up scheduled</p>
            {/if}
          </div>
        </div>

        {#if organization.lastActivityNote}
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-500">Last Activity</h3>
            <div class="mt-2 p-3 bg-gray-50 rounded-md">
              <span class="text-xs font-medium text-gray-500">{organization.lastActivityType || 'Note'}</span>
              <p class="mt-1 text-sm text-gray-700">{organization.lastActivityNote}</p>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Contacts Section -->
    <div class="bg-white rounded-xl shadow-sm mb-8">
      <div class="px-6 py-5 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Contacts</h2>
      </div>
      <div class="px-6 py-5">
        {#if organization.contacts.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each organization.contacts as contact}
              <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div class="flex items-start">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-gray-900">{contact.name}</h3>
                    <p class="text-xs text-gray-500">{contact.designation}</p>
                    <div class="mt-2 text-xs text-gray-600">
                      <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </div>
                      <div class="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contact.mobile}
                      </div>
                      {#if contact.department}
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {contact.department}
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="py-6 flex flex-col items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="text-gray-500">No contacts have been added yet</p>
            <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Contact
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Sales Pipeline Details (Accordion style) -->
    <div class="space-y-6">
      <!-- Lead Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'LEAD')} flex items-center justify-center mr-3 text-xs">1</span>
            Lead Details
          </h2>
          <div class="flex items-center">
            {#if hasLeadData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasLeadData}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Vertical</p>
                <p class="mt-1 text-sm font-medium">{organization.leads[0].vertical}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Locations</p>
                <p class="mt-1 text-sm font-medium">{organization.leads[0].totalLocations}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Category</p>
                <p class="mt-1 text-sm font-medium">{organization.leads[0].category || '-'}</p>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Expected Business Count</p>
                <p class="mt-1 text-sm font-medium">{organization.leads[0].businessExpectationsCount || '0'}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Expected Business Value</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.leads[0].businessExpectationsValue)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Expected MRR</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.leads[0].businessExpectationsMRR)}</p>
              </div>
            </div>
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-gray-500">No lead information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Lead Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Qualification Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'QUALIFICATION')} flex items-center justify-center mr-3 text-xs">2</span>
            Qualification
          </h2>
          <div class="flex items-center">
            {#if hasQualificationData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasQualificationData}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">Qualified Status</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.qualification[0].isQualified)}">
                  {formatYesNo(organization.qualification[0].isQualified)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Follow-up Date</p>
                <p class="mt-1 text-sm font-medium">
                  {formatDate(organization.qualification[0].followupDate)}
                </p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">Customer Pain</p>
                <p class="mt-1 text-sm font-medium">
                  {organization.qualification[0].customerPain || '-'}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Authority</p>
                <p class="mt-1 text-sm font-medium">
                  {organization.qualification[0].authority || '-'}
                </p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">Target Profile</p>
                <div class="mt-1 flex items-center">
                  <span class="text-sm font-medium {getYesNoClass(organization.qualification[0].isTargetProfile)}">
                    {formatYesNo(organization.qualification[0].isTargetProfile)}
                  </span>
                  {#if organization.qualification[0].targetProfileReason}
                    <span class="ml-2 text-xs text-gray-500">
                      ({organization.qualification[0].targetProfileReason})
                    </span>
                  {/if}
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500">Timing Correct</p>
                <div class="mt-1 flex items-center">
                  <span class="text-sm font-medium {getYesNoClass(organization.qualification[0].isTimingCorrect)}">
                    {formatYesNo(organization.qualification[0].isTimingCorrect)}
                  </span>
                  {#if organization.qualification[0].timingReason}
                    <span class="ml-2 text-xs text-gray-500">
                      ({organization.qualification[0].timingReason})
                    </span>
                  {/if}
                </div>
              </div>
            </div>
            
            {#if organization.qualification[0].remark}
              <div class="mt-6">
                <p class="text-sm text-gray-500">Remarks</p>
                <p class="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {organization.qualification[0].remark}
                </p>
              </div>
            {/if}
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-500">No qualification information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Qualification Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Presentation Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'PRESENTATION')} flex items-center justify-center mr-3 text-xs">3</span>
            Presentation
          </h2>
          <div class="flex items-center">
            {#if hasPresentationData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasPresentationData}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Presentation Date</p>
                <p class="mt-1 text-sm font-medium">
                  {formatDate(organization.presentation[0].presentationDate)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Qualified</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.presentation[0].isQualified)}">
                  {formatYesNo(organization.presentation[0].isQualified)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Decision Maker Involved</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.presentation[0].decisionMakerInvolved)}">
                  {formatYesNo(organization.presentation[0].decisionMakerInvolved)}
                </p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Formal Proposal Requested</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.presentation[0].formalProposalRequested)}">
                  {formatYesNo(organization.presentation[0].formalProposalRequested)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Budget Approved</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.presentation[0].budgetApproved)}">
                  {formatYesNo(organization.presentation[0].budgetApproved)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">POC Requested</p>
                <p class="mt-1 text-sm font-medium {getYesNoClass(organization.presentation[0].isPOC)}">
                  {formatYesNo(organization.presentation[0].isPOC)}
                </p>
              </div>
            </div>
            
            <div class="mt-6">
              <p class="text-sm text-gray-500">Case Closure Timeframe</p>
              <p class="mt-1 text-sm font-medium">
                {organization.presentation[0].caseClosureTimeFrame || '-'}
              </p>
            </div>
            
            {#if organization.presentation[0].remark}
              <div class="mt-6">
                <p class="text-sm text-gray-500">Remarks</p>
                <p class="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {organization.presentation[0].remark}
                </p>
              </div>
            {/if}
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p class="text-gray-500">No presentation information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Presentation Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- POC Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'POC')} flex items-center justify-center mr-3 text-xs">4</span>
            Proof of Concept
          </h2>
          <div class="flex items-center">
            {#if hasPocData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasPocData}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Total Sites</p>
                <p class="mt-1 text-sm font-medium">{organization.POC[0].totalSites}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">POC Duration</p>
                <p class="mt-1 text-sm font-medium">{organization.POC[0].POCDuration}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">POC Type</p>
                <p class="mt-1 text-sm font-medium">{organization.POC[0].POCType}</p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Business Sites</p>
                <p class="mt-1 text-sm font-medium">{organization.POC[0].businessSites}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Business Value</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.POC[0].businessValue)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Monthly Recurring Revenue</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.POC[0].MRR)}</p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Hardware Sites</p>
                <p class="mt-1 text-sm font-medium">{organization.POC[0].hardwareSites}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Avg Hardware Value</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.POC[0].avgHardwareValue)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total Hardware Value</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.POC[0].hardwareValue)}</p>
              </div>
            </div>
            
            {#if organization.POC[0].POCStatus}
              <div class="mt-6">
                <p class="text-sm text-gray-500">POC Status</p>
                <p class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {organization.POC[0].POCStatus}
                </p>
              </div>
            {/if}
            
            {#if organization.POC[0].productDetail}
              <div class="mt-6">
                <p class="text-sm text-gray-500">Product Details</p>
                <p class="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {organization.POC[0].productDetail}
                </p>
              </div>
            {/if}
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-500">No POC information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add POC Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Proposal Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'PROPOSAL')} flex items-center justify-center mr-3 text-xs">5</span>
            Proposal
          </h2>
          <div class="flex items-center">
            {#if hasProposalData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasProposalData}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">Submission Date</p>
                <p class="mt-1 text-sm font-medium">
                  {formatDate(organization.proposal[0].submissionDate)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Proposal Value</p>
                <p class="mt-1 text-sm font-medium">
                  {formatCurrency(organization.proposal[0].value)}
                </p>
              </div>
            </div>
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500">No proposal information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Proposal Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Negotiation Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'NEGOTIATION')} flex items-center justify-center mr-3 text-xs">6</span>
            Negotiation
          </h2>
          <div class="flex items-center">
            {#if hasNegotiationData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5 border-b border-gray-200">
          {#if hasNegotiationData}
            <div class="mt-1">
              <p class="text-sm text-gray-500">Follow-up Details</p>
              {#if typeof organization.negotiation[0].followUp === 'object' && organization.negotiation[0].followUp !== null}
                <div class="mt-2 bg-gray-50 rounded-md p-4">
                  <pre class="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(organization.negotiation[0].followUp, null, 2)}
                  </pre>
                </div>
              {:else}
                <p class="mt-1 text-sm text-gray-700">No follow-up details available</p>
              {/if}
            </div>
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p class="text-gray-500">No negotiation information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Negotiation Information
              </button>
            </div>
          {/if}
        </div>
      </div>

      <!-- Order Details -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <button class="w-full px-6 py-5 flex justify-between items-center focus:outline-none border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="inline-block w-8 h-8 rounded-full {getStageBadge(organization.salesStage, 'ORDER')} flex items-center justify-center mr-3 text-xs">7</span>
            Order
          </h2>
          <div class="flex items-center">
            {#if hasOrderData}
              <span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 mr-2">Data Available</span>
            {:else}
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 mr-2">No Data</span>
            {/if}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="px-6 py-5">
          {#if hasOrderData}
            <div class="mb-6">
              <div class="inline-flex items-center px-4 py-2 rounded-lg 
                {organization.order[0].projectStatus === 'CLOSED_WON' ? 'bg-green-100 text-green-800' : 
                organization.order[0].projectStatus === 'CLOSED_LOST' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {#if organization.order[0].projectStatus === 'CLOSED_WON'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  {:else if organization.order[0].projectStatus === 'CLOSED_LOST'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  {:else}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  {/if}
                </svg>
                Status: {organization.order[0].projectStatus.replace('_', ' ')}
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500">Final Order Value</p>
                <p class="mt-1 text-sm font-medium">{formatCurrency(organization.order[0].finalOrderValue)}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Final Business Value</p>
                <p class="mt-1 text-sm font-medium">{organization.order[0].finalBusinessValue || '-'}</p>
              </div>
            </div>
            
            {#if organization.order[0].totalHardwareSites !== null}
              <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p class="text-sm text-gray-500">Total Hardware Sites</p>
                  <p class="mt-1 text-sm font-medium">{organization.order[0].totalHardwareSites}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Avg Hardware Value</p>
                  <p class="mt-1 text-sm font-medium">{formatCurrency(organization.order[0].avgHardwareValue)}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Total Hardware Value</p>
                  <p class="mt-1 text-sm font-medium">{formatCurrency(organization.order[0].totalHardwareValue)}</p>
                </div>
              </div>
            {/if}
            
            {#if organization.order[0].projectStatus === 'CLOSED_LOST' && organization.order[0].lossReason}
              <div class="mt-6 p-4 bg-red-50 rounded-md border border-red-100">
                <h4 class="text-sm font-medium text-red-800 mb-1">Loss Reason</h4>
                <p class="text-sm text-red-700">{organization.order[0].lossReason}</p>
              </div>
            {/if}
          {:else}
            <div class="py-6 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p class="text-gray-500">No order information has been entered yet</p>
              <button class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Order Information
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Tags Section -->
    {#if organization.tags && organization.tags.length > 0}
      <div class="bg-white rounded-xl shadow-sm mt-8 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Tags</h2>
        <div class="flex flex-wrap gap-2">
          {#each organization.tags as tag}
            <span class="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>