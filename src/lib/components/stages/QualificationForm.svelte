<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  export let organizationId: string;
  export let currentData: any = null;
  
  let isLoading = false;
  let isSubmitting = false;
  let successMessage = '';
  let errorMessage = '';
  
  // Form data
  let form = {
    id: '',
    isQualified: 'no',
    customerPain: '',
    authority: 'Influencer',
    consequence: '',
    isTargetProfile: 'no',
    targetProfileReason: '',
    isTimingCorrect: 'no',
    timingReason: '',
    agreedForPresentation: 'no',
    qualificationDate: new Date().toISOString().slice(0, 10),
    status: 'IN_PROGRESS',
    dropReason: '',
    followups: []
  };
  
  let newFollowup = {
    remark: '',
    followupDate: new Date().toISOString().slice(0, 10)
  };
  
  // Calculate days in stage
  let daysInStage = 0;
  let isApproachingDeadline = false;
  let isPastDeadline = false;
  
  // Fetch data on component mount if not provided via props
onMount(async () => {
  if (currentData) {
    initializeFormWithData(currentData);
    isLoading = false;
  } else {
    isLoading = true;
    try {
      const response = await fetch(`/api/organizations/${organizationId}/current-qualification`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          console.log("Received data from API:", data);
          // Check that followups exist in the data
          console.log("Followups in received data:", data.followups);
          initializeFormWithData(data);
        }
      }
    } catch (error) {
      console.error('Error loading qualification data:', error);
      errorMessage = 'Failed to load qualification data';
    } finally {
      isLoading = false;
    }
  }
});

  //nowpasted
function initializeFormWithData(data) {
  console.log('Initializing form with data:', data);

    // Make sure data.followups is an array before trying to map it
  const followups = Array.isArray(data.followups) 
    ? data.followups.map(f => ({
        id: f.id,
        remark: f.remark,
        followupDate: new Date(f.followupDate).toISOString().slice(0, 10)
      })) 
    : [];
  
  console.log('Processed followups:', followups);
  console.log('Followups from data:', data.followups);
  console.log('data', data);
  
  form = {
    id: data.id || '',
    isQualified: data.isQualified || 'no',
    customerPain: data.customerPain || '',
    authority: data.authority || 'Influencer',
    consequence: data.consequence || '',
    isTargetProfile: data.isTargetProfile || 'no',
    targetProfileReason: data.targetProfileReason || '',
    isTimingCorrect: data.isTimingCorrect || 'no',
    timingReason: data.timingReason || '',
    agreedForPresentation: data.agreedForPresentation || 'no',
    qualificationDate: data.qualificationDate ? new Date(data.qualificationDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: data.status || 'IN_PROGRESS',
    dropReason: data.dropReason || '',
    followups: followups
  };
  
  console.log('Form with initialized followups:', form.followups);
  
  // Calculate days in stage
  if (data.stageEntryDate) {
    const entryDate = new Date(data.stageEntryDate);
    const today = new Date();
    const timeDiff = today.getTime() - entryDate.getTime();
    daysInStage = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    isApproachingDeadline = daysInStage >= 30 && daysInStage < 45;
    isPastDeadline = daysInStage >= 45;
  }
}

// Modify the submit function to properly handle followups
async function submitForm() {
  const errors = validate();
  
  // Mark all fields as touched
  Object.keys(touched).forEach(key => {
    touched[key as keyof typeof touched] = true;
  });
  
  if (errors.length > 0) {
    errorMessage = errors.join('. ');
    return;
  }
  
  isSubmitting = true;
  errorMessage = '';
  
  try {
    // Prepare data for API
    const apiData = {
      ...form,
      qualificationDate: new Date(form.qualificationDate).toISOString(),
      followups: form.followups.map(f => ({
        id: f.id || null,
        remark: f.remark,
        followupDate: new Date(f.followupDate).toISOString()
      }))
    };
    
    console.log('Submitting data with followups:', apiData.followups);
    
    // URL for create or update
    const url = form.id 
      ? `/api/organizations/${organizationId}/qualification/${form.id}` 
      : `/api/organizations/${organizationId}/qualification`;
    
    const response = await fetch(url, {
      method: form.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save qualification data');
    }
    
    const result = await response.json();
    console.log('Response received:', result);
    console.log('Followups in response:', result.followups);
    
    // Update form with received data, especially to get the updated followups
    initializeFormWithData(result);
    
    // Set success message based on status
    if (form.status === 'MOVED_TO_NEXT') {
      successMessage = 'Qualification saved and moved to Presentation stage!';
    } else if (form.status === 'DROPPED') {
      successMessage = 'Qualification marked as dropped and deal closed as lost.';
    } else {
      successMessage = 'Qualification data saved successfully!';
    }
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage = '';
    }, 3000);
    
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }
  } finally {
    isSubmitting = false;
  }
}
  //nowpasted
  
  
  // Validation state
  let touched = {
    customerPain: false,
    authority: false,
    consequence: false,
    qualificationDate: false,
    targetProfileReason: false,
    timingReason: false,
    dropReason: false
  };
  
  // Authority options
  const authorityOptions = ['Influencer', 'Decision Maker', 'Other'];
  
  // Status options
  const statusOptions = ['IN_PROGRESS', 'MOVED_TO_NEXT', 'DROPPED', 'HOLD'];
  
  // Show confirmation dialog for status change
  let showStatusConfirmation = false;
  let previousStatus = '';
  let pendingStatusChange = '';
  
  function handleStatusChange(event) {
    const newStatus = event.target.value;
    
    // If changing to MOVED_TO_NEXT or DROPPED, show confirmation
    if ((newStatus === 'MOVED_TO_NEXT' || newStatus === 'DROPPED') && 
        form.status !== newStatus) {
      previousStatus = form.status;
      pendingStatusChange = newStatus;
      showStatusConfirmation = true;
    } else {
      form.status = newStatus;
    }
  }
  
  function confirmStatusChange() {
    form.status = pendingStatusChange;
    showStatusConfirmation = false;
  }
  
  function cancelStatusChange() {
    form.status = previousStatus;
    showStatusConfirmation = false;
  }
  
  // Validation functions
  function validate() {
    const errors: string[] = [];
    
    if (!form.customerPain) errors.push('Customer pain is required');
    if (!form.authority) errors.push('Authority information is required');
    if (!form.consequence) errors.push('Consequence information is required');
    if (!form.qualificationDate) errors.push('Qualification date is required');
    
    if (form.isTargetProfile === 'no' && !form.targetProfileReason) {
      errors.push('Reason is required when customer is not part of target profile');
    }
    
    if (form.isTimingCorrect === 'no' && !form.timingReason) {
      errors.push('Reason is required when timing is not correct');
    }
    
    if (form.status === 'DROPPED' && !form.dropReason) {
      errors.push('Drop reason is required when status is set to DROPPED');
    }
    
    return errors;
  }
  
  // Add new followup
  function addFollowup() {
    if (newFollowup.remark && newFollowup.followupDate) {
      form.followups = [
        ...form.followups, 
        { 
          id: null, // New followups don't have an ID yet
          remark: newFollowup.remark, 
          followupDate: newFollowup.followupDate 
        }
      ];
      
      // Reset new followup form
      newFollowup = {
        remark: '',
        followupDate: new Date().toISOString().slice(0, 10)
      };
    }
  }
  
  // Remove followup
  function removeFollowup(index: number) {
    form.followups = form.followups.filter((_, i) => i !== index);
  }
  
  
  $: if (currentData?.stageEntryDate) {
    const entryDate = new Date(currentData.stageEntryDate);
    const today = new Date();
    const timeDiff = today.getTime() - entryDate.getTime();
    daysInStage = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    isApproachingDeadline = daysInStage >= 30 && daysInStage < 45;
    isPastDeadline = daysInStage >= 45;
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold text-gray-900">Qualification Assessment</h2>
    
    {#if daysInStage > 0}
      <div class="flex items-center">
        <span class="mr-2 text-sm">Days in stage: </span>
        <span class="{isPastDeadline ? 'bg-red-100 text-red-800' : isApproachingDeadline ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'} px-2.5 py-0.5 rounded-full text-xs font-medium">
          {daysInStage}
        </span>
        
        {#if isPastDeadline}
          <span class="ml-2 text-xs text-red-600 font-medium">Past 45-day deadline!</span>
        {:else if isApproachingDeadline}
          <span class="ml-2 text-xs text-yellow-600 font-medium">Approaching 45-day deadline</span>
        {/if}
      </div>
    {/if}
  </div>
  
  {#if successMessage}
    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{successMessage}</span>
    </div>
  {/if}
  
  {#if errorMessage}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span class="block sm:inline">{errorMessage}</span>
    </div>
  {/if}
  
  <form on:submit|preventDefault={submitForm} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Customer Qualification -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Does the Customer Qualify?
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isQualified} 
              value="yes" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isQualified} 
              value="no" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>
      
      <!-- Customer Pain -->
      <div class="col-span-1 md:col-span-2">
        <label for="customerPain" class="block text-sm font-medium text-gray-700 mb-1">
          What is the Pain of The Customer *
        </label>
        <textarea
          id="customerPain"
          bind:value={form.customerPain}
          on:blur={() => touched.customerPain = true}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.customerPain && !form.customerPain ? 'border-red-300' : ''}"
          rows="3"
        ></textarea>
        {#if touched.customerPain && !form.customerPain}
          <p class="mt-1 text-sm text-red-600">Customer pain is required</p>
        {/if}
      </div>
      
      <!-- Customer Authority -->
      <div class="col-span-1">
        <label for="authority" class="block text-sm font-medium text-gray-700 mb-1">
          Is the Contact Right Authority *
        </label>
        <select
          id="authority"
          bind:value={form.authority}
          on:blur={() => touched.authority = true}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.authority && !form.authority ? 'border-red-300' : ''}"
        >
          {#each authorityOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
        {#if touched.authority && !form.authority}
          <p class="mt-1 text-sm text-red-600">Authority information is required</p>
        {/if}
      </div>
      
      <!-- Consequence -->
      <div class="col-span-1 md:col-span-2">
        <label for="consequence" class="block text-sm font-medium text-gray-700 mb-1">
          What will be the Consequence for the customer on our Solution *
        </label>
        <textarea
          id="consequence"
          bind:value={form.consequence}
          on:blur={() => touched.consequence = true}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.consequence && !form.consequence ? 'border-red-300' : ''}"
          rows="3"
        ></textarea>
        {#if touched.consequence && !form.consequence}
          <p class="mt-1 text-sm text-red-600">Consequence information is required</p>
        {/if}
      </div>
      
      <!-- Target Profile -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Does the Customer Part of our Target Vertical/Profile?
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isTargetProfile} 
              value="yes" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isTargetProfile} 
              value="no" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>
      
      <!-- Target Profile Reason -->
      {#if form.isTargetProfile === 'no'}
        <div class="col-span-1">
          <label for="targetProfileReason" class="block text-sm font-medium text-gray-700 mb-1">
            Why?
          </label>
          <input
            type="text"
            id="targetProfileReason"
            bind:value={form.targetProfileReason}
            on:blur={() => touched.targetProfileReason = true}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.targetProfileReason && !form.targetProfileReason ? 'border-red-300' : ''}"
          />
          {#if touched.targetProfileReason && !form.targetProfileReason}
            <p class="mt-1 text-sm text-red-600">Reason is required</p>
          {/if}
        </div>
      {/if}
      
      <!-- Timing -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Is the Timing Correct for us to meet the Customer?
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isTimingCorrect} 
              value="yes" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.isTimingCorrect} 
              value="no" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>
      
      <!-- Timing Reason -->
      {#if form.isTimingCorrect === 'no'}
        <div class="col-span-1">
          <label for="timingReason" class="block text-sm font-medium text-gray-700 mb-1">
            Why?
          </label>
          <input
            type="text"
            id="timingReason"
            bind:value={form.timingReason}
            on:blur={() => touched.timingReason = true}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.timingReason && !form.timingReason ? 'border-red-300' : ''}"
          />
          {#if touched.timingReason && !form.timingReason}
            <p class="mt-1 text-sm text-red-600">Reason is required</p>
          {/if}
        </div>
      {/if}
      
      <!-- Presentation Agreement -->
      <div class="col-span-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Has the Customer Agreed for the Presentation along with Decision Maker?
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.agreedForPresentation} 
              value="yes" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">Yes</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="radio" 
              bind:group={form.agreedForPresentation} 
              value="no" 
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            >
            <span class="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>
      
      <!-- Qualification Date -->
      <div class="col-span-1">
        <label for="qualificationDate" class="block text-sm font-medium text-gray-700 mb-1">
          Date of Qualifying the Customer *
        </label>
        <input
          type="date"
          id="qualificationDate"
          bind:value={form.qualificationDate}
          on:blur={() => touched.qualificationDate = true}
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.qualificationDate && !form.qualificationDate ? 'border-red-300' : ''}"
        />
        {#if touched.qualificationDate && !form.qualificationDate}
          <p class="mt-1 text-sm text-red-600">Qualification date is required</p>
        {/if}
      </div>
      
  <!-- Status selection with confirmation dialog -->
  <div class="col-span-1">
    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
      Status
    </label>
    <select
      id="status"
      value={form.status}
      on:change={handleStatusChange}
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    >
      {#each statusOptions as option}
        <option value={option}>{option.replace(/_/g, ' ')}</option>
      {/each}
    </select>
    
    {#if form.status === 'MOVED_TO_NEXT'}
      <p class="mt-1 text-xs text-green-600">This will move the organization to the Presentation stage.</p>
    {:else if form.status === 'DROPPED'}
      <p class="mt-1 text-xs text-red-600">This will mark the organization as Closed Lost.</p>
    {/if}
  </div>
  
  <!-- Status change confirmation dialog -->
  {#if showStatusConfirmation}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Status Change</h3>
        <p class="text-sm text-gray-600 mb-4">
          {#if pendingStatusChange === 'MOVED_TO_NEXT'}
            Are you sure you want to move this qualification to the Presentation stage? 
            This will update the organization's sales stage to "PRESENTATION".
          {:else if pendingStatusChange === 'DROPPED'}
            Are you sure you want to mark this qualification as dropped? 
            This will update the organization's sales stage to "CLOSED_LOST".
          {/if}
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            on:click={cancelStatusChange}
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            on:click={confirmStatusChange}
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  {/if}
      
      <!-- Drop Reason -->
      {#if form.status === 'DROPPED' || form.status === 'HOLD'}
        <div class="col-span-1 md:col-span-2">
          <label for="dropReason" class="block text-sm font-medium text-gray-700 mb-1">
            Reason for Dropped/Hold *
          </label>
          <textarea
            id="dropReason"
            bind:value={form.dropReason}
            on:blur={() => touched.dropReason = true}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {touched.dropReason && !form.dropReason ? 'border-red-300' : ''}"
            rows="2"
          ></textarea>
          {#if touched.dropReason && !form.dropReason}
            <p class="mt-1 text-sm text-red-600">Drop reason is required</p>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Followups Section -->
    <div class="pt-6 border-t border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Follow-ups</h3>
      
      <!-- Add new followup -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <div class="md:col-span-8">
          <label for="newRemark" class="block text-sm font-medium text-gray-700 mb-1">
            Remark
          </label>
          <input
            type="text"
            id="newRemark"
            bind:value={newFollowup.remark}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter follow-up details"
          />
        </div>
        
        <div class="md:col-span-3">
          <label for="newFollowupDate" class="block text-sm font-medium text-gray-700 mb-1">
            Next Follow-up Date
          </label>
          <input
            type="date"
            id="newFollowupDate"
            bind:value={newFollowup.followupDate}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div class="md:col-span-1 flex items-end">
          <button
            type="button"
            on:click={addFollowup}
            disabled={!newFollowup.remark || !newFollowup.followupDate}
            class="w-full py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
      
      <!-- Followups List -->
      {#if form.followups.length > 0}
        <div class="bg-white shadow overflow-hidden rounded-md mt-4">
          <ul class="divide-y divide-gray-200">
            {#each form.followups as followup, index}
              <li class="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-900">{followup.remark}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    Follow-up Date: {new Date(followup.followupDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  on:click={() => removeFollowup(index)}
                  class="ml-2 text-red-600 hover:text-red-900"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <p class="text-sm text-gray-500 italic">No follow-ups added yet.</p>
      {/if}
    </div>
    
    <!-- Submit Button -->
    <div class="flex justify-end pt-6">
      <button
        type="submit"
        disabled={isSubmitting}
        class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {#if isSubmitting}
          <span class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        {:else}
          {form.id ? 'Update Qualification' : 'Save Qualification'}
        {/if}
      </button>
    </div>
  </form>
</div>