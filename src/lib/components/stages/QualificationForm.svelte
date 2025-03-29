<!-- src/lib/components/stages/QualificationForm.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Swal from 'sweetalert2';
  
  export let organizationId: string;
  export let currentData: any = null;
  
  let isLoading = false;
  let isSubmitting = false;
  let isEditMode = false;
  
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
  
  // Is the form in read-only mode (moved to next stage)
  let isReadOnly = false;
  
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load qualification data',
          confirmButtonColor: '#4F46E5'
        });
      } finally {
        isLoading = false;
      }
    }
  });

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
    
    // Check if form is in read-only mode
    isReadOnly = data.status === 'MOVED_TO_NEXT';
    
    // Set edit mode to false initially
    isEditMode = false;
    
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

  async function submitForm() {
    const errors = validate();
    
    // Mark all fields as touched
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });
    
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: errors.join('. '),
        confirmButtonColor: '#4F46E5'
      });
      return;
    }
    
    isSubmitting = true;
    
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
      
      // Update form with received data, especially to get the updated followups
      initializeFormWithData(result);
      
      // Set success message based on status
      let successMessage = '';
      
      if (form.status === 'MOVED_TO_NEXT') {
        successMessage = 'Qualification saved and moved to Presentation stage!';
      } else if (form.status === 'DROPPED') {
        successMessage = 'Qualification marked as dropped and deal closed as lost.';
      } else {
        successMessage = 'Qualification data saved successfully!';
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: successMessage,
        confirmButtonColor: '#4F46E5'
      });
      
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#4F46E5'
      });
    } finally {
      isSubmitting = false;
    }
  }
  
  // Toggle edit mode
  function toggleEditMode() {
    isEditMode = !isEditMode;
  }
  
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
  
  // Show each section
  let showQualificationSection = true;
  let showTargetProfileSection = true;
  let showTimingSection = true;
  let showFollowupsSection = true;
  
  $: if (currentData?.stageEntryDate) {
    const entryDate = new Date(currentData.stageEntryDate);
    const today = new Date();
    const timeDiff = today.getTime() - entryDate.getTime();
    daysInStage = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    isApproachingDeadline = daysInStage >= 30 && daysInStage < 45;
    isPastDeadline = daysInStage >= 45;
  }
  
  // Check if fields should be disabled
  $: isFieldDisabled = isReadOnly && !isEditMode;
</script>

<div class="max-w-5xl mx-auto bg-white shadow-sm rounded-xl overflow-hidden">
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  {:else}
    <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center">
          <span class="mr-3">Qualification Assessment</span>
          {#if form.status === 'IN_PROGRESS'}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              In Progress
            </span>
          {:else if form.status === 'MOVED_TO_NEXT'}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Moved to Presentation
            </span>
          {:else if form.status === 'DROPPED'}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Dropped
            </span>
          {:else if form.status === 'HOLD'}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              On Hold
            </span>
          {/if}
        </h1>
        
        {#if daysInStage > 0}
          <div class="mt-2 md:mt-0 flex items-center">
            <span class="mr-2 text-sm font-medium text-gray-600">Time in stage:</span>
            <span class="{isPastDeadline ? 'bg-red-100 text-red-800' : isApproachingDeadline ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-xs font-semibold">
              {daysInStage} days
              {#if isPastDeadline}
                <span class="ml-1">&#9888;</span>
              {/if}
            </span>
            
            {#if isPastDeadline}
              <span class="ml-2 text-xs text-red-600 font-medium">Past 45-day deadline!</span>
            {:else if isApproachingDeadline}
              <span class="ml-2 text-xs text-yellow-600 font-medium">Approaching 45-day deadline</span>
            {/if}
          </div>
        {/if}

        {#if isReadOnly}
          <button 
            type="button"
            on:click={toggleEditMode}
            class="mt-4 md:mt-0 md:ml-4 px-4 py-2 {isEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {#if isEditMode}
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                Cancel Edit
              </div>
            {:else}
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </div>
            {/if}
          </button>
        {/if}
      </div>
    </div>
    
    <form on:submit|preventDefault={submitForm} class="p-6">
      <!-- Qualification Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Customer Qualification
          </h2>
          <button 
            type="button" 
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            on:click={() => showQualificationSection = !showQualificationSection}
          >
            {#if showQualificationSection}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        </div>
        
        {#if showQualificationSection}
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-6">
            <!-- Customer Qualification -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Does the Customer Qualify?
                </label>
                <div class="flex space-x-6">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isQualified} 
                      disabled={isFieldDisabled}
                      value="yes" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isQualified}
                      disabled={isFieldDisabled} 
                      value="no" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <div class="col-span-1">
                <label for="qualificationDate" class="block text-sm font-medium text-gray-700 mb-2">
                  Date of Qualification *
                </label>
                <input
                  type="date"
                  id="qualificationDate"
                  bind:value={form.qualificationDate}
                  disabled={isFieldDisabled}
                  on:blur={() => touched.qualificationDate = true}
                  class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.qualificationDate && !form.qualificationDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                />
                {#if touched.qualificationDate && !form.qualificationDate}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Qualification date is required
                  </p>
                {/if}
              </div>
              
              <!-- Customer Pain -->
              <div class="col-span-1 md:col-span-2">
                <label for="customerPain" class="block text-sm font-medium text-gray-700 mb-2">
                  What is the Pain of The Customer? *
                </label>
                <textarea
                  id="customerPain"
                  bind:value={form.customerPain}
                  disabled={isFieldDisabled}
                  on:blur={() => touched.customerPain = true}
                  class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.customerPain && !form.customerPain ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                  rows="3"
                  placeholder="Describe the customer's pain points and challenges"
                ></textarea>
                {#if touched.customerPain && !form.customerPain}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Customer pain is required
                  </p>
                {/if}
              </div>
              
              <!-- Customer Authority -->
              <div class="col-span-1">
                <label for="authority" class="block text-sm font-medium text-gray-700 mb-2">
                  Contact's Authority Level *
                </label>
                <div class="relative">
                  <select
                    id="authority"
                    bind:value={form.authority}
                    disabled={isFieldDisabled}
                    on:blur={() => touched.authority = true}
                    class="block w-full pl-3 pr-10 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none {touched.authority && !form.authority ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                  >
                    {#each authorityOptions as option}
                      <option value={option}>{option}</option>
                    {/each}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                {#if touched.authority && !form.authority}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Authority information is required
                  </p>
                {/if}
              </div>
              
              <!-- Presentation Agreement -->
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Has the Customer Agreed for Presentation with Decision Maker?
                </label>
                <div class="flex space-x-6">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.agreedForPresentation} 
                      disabled={isFieldDisabled}
                      value="yes" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.agreedForPresentation} 
                      disabled={isFieldDisabled}
                      value="no" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <!-- Consequence -->
              <div class="col-span-1 md:col-span-2">
                <label for="consequence" class="block text-sm font-medium text-gray-700 mb-2">
                  What will be the Consequence for the Customer with our Solution? *
                </label>
                <textarea
                  id="consequence"
                  bind:value={form.consequence}
                  disabled={isFieldDisabled}
                  on:blur={() => touched.consequence = true}
                  class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.consequence && !form.consequence ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                  rows="3"
                  placeholder="Describe the positive outcomes and value for the customer"
                ></textarea>
                {#if touched.consequence && !form.consequence}
                  <p class="mt-1 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Consequence information is required
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Target Profile Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Target Profile Assessment
          </h2>
          <button 
            type="button" 
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            on:click={() => showTargetProfileSection = !showTargetProfileSection}
          >
            {#if showTargetProfileSection}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        </div>
        
        {#if showTargetProfileSection}
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Target Profile -->
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Is the Customer in our Target Vertical/Profile?
                </label>
                <div class="flex space-x-6">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isTargetProfile} 
                      disabled={isFieldDisabled}
                      value="yes" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isTargetProfile} 
                      disabled={isFieldDisabled}
                      value="no" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <!-- Target Profile Reason -->
              {#if form.isTargetProfile === 'no'}
                <div class="col-span-1">
                  <label for="targetProfileReason" class="block text-sm font-medium text-gray-700 mb-2">
                    Why not in target profile? *
                  </label>
                  <input
                    type="text"
                    id="targetProfileReason"
                    bind:value={form.targetProfileReason}
                    disabled={isFieldDisabled}
                    on:blur={() => touched.targetProfileReason = true}
                    class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.targetProfileReason && !form.targetProfileReason ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                    placeholder="Explain why customer doesn't match target profile"
                  />
                  {#if touched.targetProfileReason && !form.targetProfileReason}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Reason is required
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Timing Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            Timing Assessment
          </h2>
          <button 
            type="button" 
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            on:click={() => showTimingSection = !showTimingSection}
          >
            {#if showTimingSection}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        </div>
        
        {#if showTimingSection}
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Timing -->
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Is the Timing Correct for Meeting the Customer?
                </label>
                <div class="flex space-x-6">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isTimingCorrect} 
                      disabled={isFieldDisabled}
                      value="yes" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      bind:group={form.isTimingCorrect}
                      disabled={isFieldDisabled} 
                      value="no" 
                      class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    >
                    <span class="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>
              
              <!-- Timing Reason -->
              {#if form.isTimingCorrect === 'no'}
                <div class="col-span-1">
                  <label for="timingReason" class="block text-sm font-medium text-gray-700 mb-2">
                    Why is timing not correct? *
                  </label>
                  <input
                    type="text"
                    id="timingReason"
                    bind:value={form.timingReason}
                    disabled={isFieldDisabled}
                    on:blur={() => touched.timingReason = true}
                    class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.timingReason && !form.timingReason ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                    placeholder="Explain timing issues"
                  />
                  {#if touched.timingReason && !form.timingReason}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Reason is required
                    </p>
                  {/if}
                </div>
              {/if}
              
              <!-- Status selection with confirmation dialog -->
              <div class="col-span-1 md:col-span-2">
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div class="relative">
                  <select
                    id="status"
                    value={form.status}
                    disabled={isFieldDisabled}
                    on:change={handleStatusChange}
                    class="block w-full pl-3 pr-10 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
                  >
                    {#each statusOptions as option}
                      <option value={option}>{option.replace(/_/g, ' ')}</option>
                    {/each}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {#if form.status === 'MOVED_TO_NEXT'}
                  <p class="mt-2 text-sm text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    This will move the organization to the Presentation stage
                  </p>
                {:else if form.status === 'DROPPED'}
                  <p class="mt-2 text-sm text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    This will mark the organization as Closed Lost
                  </p>
                {/if}
              </div>
              
              <!-- Drop Reason -->
              {#if form.status === 'DROPPED' || form.status === 'HOLD'}
                <div class="col-span-1 md:col-span-2">
                  <label for="dropReason" class="block text-sm font-medium text-gray-700 mb-2">
                    Reason for {form.status === 'DROPPED' ? 'Dropping' : 'Holding'} *
                  </label>
                  <textarea
                    id="dropReason"
                    bind:value={form.dropReason}
                    disabled={isFieldDisabled}
                    on:blur={() => touched.dropReason = true}
                    class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm {touched.dropReason && !form.dropReason ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}"
                    rows="2"
                    placeholder="Explain reason for changing status"
                  ></textarea>
                  {#if touched.dropReason && !form.dropReason}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Reason is required
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Followups Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
            </svg>
            Follow-ups
          </h2>
          <button 
            type="button" 
            class="text-gray-500 hover:text-gray-700 focus:outline-none"
            on:click={() => showFollowupsSection = !showFollowupsSection}
          >
            {#if showFollowupsSection}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        </div>
        
        {#if showFollowupsSection}
          <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <!-- Add new followup -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
              <div class="md:col-span-7">
                <label for="newRemark" class="block text-sm font-medium text-gray-700 mb-2">
                  Remark
                </label>
                <input
                  type="text"
                  id="newRemark"
                  bind:value={newFollowup.remark}
                  disabled={isFieldDisabled}
                  class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter follow-up details"
                />
              </div>
              
              <div class="md:col-span-3">
                <label for="newFollowupDate" class="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  id="newFollowupDate"
                  bind:value={newFollowup.followupDate}
                  disabled={isFieldDisabled}
                  class="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div class="md:col-span-2 flex items-end">
                <button
                  type="button"
                  on:click={addFollowup}
                  disabled={!newFollowup.remark || !newFollowup.followupDate}
                  class="w-full py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <div class="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Add
                  </div>
                </button>
              </div>
            </div>
            
            <!-- Followups List -->
            {#if form.followups.length > 0}
              <div class="mt-6 bg-gray-50 rounded-lg overflow-hidden">
                <ul class="divide-y divide-gray-200">
                  {#each form.followups as followup, index}
                    <li class="px-4 py-3 hover:bg-gray-100 transition-colors duration-150">
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="text-sm font-medium text-gray-800">{followup.remark}</p>
                          <p class="mt-1 text-xs text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(followup.followupDate).toLocaleDateString()}
                          </p>
                        </div>
                        {#if !isFieldDisabled}
                        <button
                          type="button"
                          on:click={() => removeFollowup(index)}
                          class="text-red-500 hover:text-red-700 focus:outline-none transition-colors duration-200"
                          aria-label="Remove followup"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                         {/if}
                      </div>
                     
                    </li>
                  {/each}
                </ul>
              </div>
            {:else}
              <div class="mt-4 text-center py-6 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">No follow-ups added yet</p>
                <p class="text-xs text-gray-400">Add follow-ups to track important customer interactions</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Submit Button -->
      <div class="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          class="py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
        >
          {#if isSubmitting}
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {form.id ? 'Update Qualification' : 'Save Qualification'}
          {/if}
        </button>
      </div>
    </form>
  {/if}
  
  <!-- Status change confirmation dialog -->
  {#if showStatusConfirmation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Confirm Status Change
          </h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600">
            {#if pendingStatusChange === 'MOVED_TO_NEXT'}
              Are you sure you want to move this qualification to the <strong>Presentation stage</strong>? 
              This will update the organization's sales stage to <span class="font-medium text-green-600">PRESENTATION</span>.
            {:else if pendingStatusChange === 'DROPPED'}
              Are you sure you want to mark this qualification as <strong>dropped</strong>? 
              This will update the organization's sales stage to <span class="font-medium text-red-600">CLOSED_LOST</span>.
            {/if}
          </p>
        </div>
        <div class="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button" 
            on:click={cancelStatusChange}
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            type="button" 
            on:click={confirmStatusChange}
            class="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>



<!-- Loading Overlay -->
{#if isSubmitting}
  <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      <span class="text-gray-700 font-medium">Saving qualification data...</span>
    </div>
  </div>
{/if}

<style>
  /* Toast animation */
  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Improved focus styles */
  :global(input:focus, textarea:focus, select:focus) {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
  
  /* Smooth transitions */
  :global(input, textarea, select, button) {
    transition: all 0.2s ease-in-out;
  }
  
  /* Card hover effects */
  :global(.hover-shadow) {
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  
  :global(.hover-shadow:hover) {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  }
</style>