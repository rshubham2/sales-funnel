<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import CalendarIcon from 'lucide-svelte/icons/calendar';
  import FileUpload from 'lucide-svelte/icons/file-up';
  import Save from 'lucide-svelte/icons/save';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  
  export let organizationId: string;
  export let currentData: any = null;
  
  // Form data
  let presentationDate: string = '';
  let isQualified: string = 'no';
  let decisionMakerInvolved: string = 'no';
  let formalProposalRequested: string = 'no';
  let budgetApproved: string = 'no';
  let caseClosureTimeFrame: string = '';
  let isPOC: string = 'no';
  let status: string = 'IN_PROGRESS';
  let dropReason: string = '';
  
  // Followup data
  let followupRemark: string = '';
  let followupDate: string = '';
  let followups: any[] = [];
  
  // File upload
  let selectedFile: File | null = null;
  let fileUploadProgress: number = 0;
  let uploadedFiles: any[] = [];
  
  // Form state
  let isSubmitting: boolean = false;
  let error: string = '';
  let successMessage: string = '';
  
  onMount(async () => {
    if (currentData) {
      // Populate form with existing data
      presentationDate = currentData.presentationDate 
        ? new Date(currentData.presentationDate).toISOString().split('T')[0] 
        : '';
      isQualified = currentData.isQualified || 'no';
      decisionMakerInvolved = currentData.decisionMakerInvolved || 'no';
      formalProposalRequested = currentData.formalProposalRequested || 'no';
      budgetApproved = currentData.budgetApproved || 'no';
      caseClosureTimeFrame = currentData.caseClosureTimeFrame || '';
      isPOC = currentData.isPOC || 'no';
      status = currentData.status || 'IN_PROGRESS';
      dropReason = currentData.dropReason || '';
      
      // Load followups if they exist
      if (currentData.followups && Array.isArray(currentData.followups)) {
        followups = currentData.followups.map((f: any) => ({
          ...f,
          followupDate: new Date(f.followupDate).toISOString().split('T')[0]
        }));
      }
      
      // Load uploaded files if they exist
      if (currentData.files && Array.isArray(currentData.files)) {
        uploadedFiles = currentData.files;
      }
    } else if (organizationId) {
      // Try to fetch existing presentation data for this organization
      try {
        const response = await fetch(`/api/sales/presentation?organizationId=${organizationId}`);
        
        if (response.ok) {
          const data = await response.json();
          currentData = data;
          
          // Populate form with fetched data
          presentationDate = data.presentationDate 
            ? new Date(data.presentationDate).toISOString().split('T')[0] 
            : '';
          isQualified = data.isQualified || 'no';
          decisionMakerInvolved = data.decisionMakerInvolved || 'no';
          formalProposalRequested = data.formalProposalRequested || 'no';
          budgetApproved = data.budgetApproved || 'no';
          caseClosureTimeFrame = data.caseClosureTimeFrame || '';
          isPOC = data.isPOC || 'no';
          status = data.status || 'IN_PROGRESS';
          dropReason = data.dropReason || '';
          
          // Load followups if they exist
          if (data.followups && Array.isArray(data.followups)) {
            followups = data.followups.map((f: any) => ({
              ...f,
              followupDate: new Date(f.followupDate).toISOString().split('T')[0]
            }));
          }
          
          // Load uploaded files if they exist
          if (data.files && Array.isArray(data.files)) {
            uploadedFiles = data.files;
          }
        }
      } catch (err) {
        console.error('Error fetching presentation data:', err);
        // Continue with new presentation if data doesn't exist
      }
    }
  });

  // Update the removeFile function to work with the new endpoint
async function removeFile(fileId: string) {
  try {
    error = '';
    
    // Make API call to remove file
    const response = await fetch(`/api/sales/file-upload/base64?id=${fileId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove file');
    }
    
    // Remove file from the list
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    
    successMessage = 'File removed successfully';
  } catch (err: any) {
    console.error('Error removing file:', err);
    error = err.message || 'An error occurred while removing file';
  }
}
///////
  async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile = input.files[0];
    
    // Preview functionality can be added here if needed
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // You can set a preview image here if needed
          // filePreview = e.target.result as string;
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }
}

// Upload file using Base64
async function uploadFile() {
  if (!selectedFile) {
    error = 'Please select a file to upload';
    return;
  }
  
  try {
    error = '';
    fileUploadProgress = 0;
    
    // Read file as Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Get the base64 part only (remove data:mime/type;base64, prefix)
          const base64 = e.target.result as string;
          resolve(base64);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });
    
    // Mock file upload progress
    const progressInterval = setInterval(() => {
      fileUploadProgress += 10;
      if (fileUploadProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 300);
    
    // Make API call to upload file
    const response = await fetch('/api/sales/file-upload/base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64Data,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        presentationId: currentData?.id || 'new',
        organizationId
      })
    });
    
    clearInterval(progressInterval);
    fileUploadProgress = 100;
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }
    
    const result = await response.json();
    
    // Add uploaded file to the list
    uploadedFiles = [...uploadedFiles, result.file];
    
    // If this is a new presentation, update currentData
    if (!currentData || !currentData.id) {
      currentData = { id: result.presentationId };
    }
    
    // Clear file selection
    selectedFile = null;
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    successMessage = 'File uploaded successfully';
  } catch (err: any) {
    console.error('Error uploading file:', err);
    error = err.message || 'An error occurred while uploading file';
  }
}
  ///////
  async function handleSubmit() {
    try {
      isSubmitting = true;
      error = '';
      successMessage = '';
      
      // Basic validation
      if (status === 'MOVED_TO_NEXT' && isQualified !== 'yes') {
        error = 'Customer must qualify for next stage to move forward';
        isSubmitting = false;
        return;
      }
      
      if (status === 'DROPPED' && !dropReason) {
        error = 'Please provide a reason for dropping';
        isSubmitting = false;
        return;
      }
      
      // Prepare data for API call
      const formData = {
        presentationDate: presentationDate ? new Date(presentationDate).toISOString() : null,
        isQualified,
        decisionMakerInvolved,
        formalProposalRequested,
        budgetApproved,
        caseClosureTimeFrame,
        isPOC,
        status,
        dropReason: dropReason || null,
        organizationId
      };
      
      // Determine next stage based on isPOC value
      let nextSalesStage = null;
      if (status === 'MOVED_TO_NEXT') {
        nextSalesStage = isPOC === 'yes' ? 'POC' : 'PROPOSAL';
      } else if (status === 'DROPPED') {
        nextSalesStage = 'CLOSED_LOST';
      }
      
      // Add new followups that haven't been saved yet
      const newFollowups = followups.filter(f => f.id.startsWith('temp-'));
      
      // Make API call to update presentation data
      const response = await fetch(`/api/sales/presentation`, {
        method: currentData && currentData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          id: currentData?.id,
          nextSalesStage
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save presentation data');
      }
      
      const result = await response.json();
      
      // Save new followups
      if (newFollowups.length > 0) {
        for (const followup of newFollowups) {
          await fetch('/api/sales/followup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              presentationId: result.id,
              remark: followup.remark,
              followupDate: new Date(followup.followupDate).toISOString()
            })
          });
        }
      }
      
      // Handle success
      successMessage = currentData && currentData.id
        ? 'Presentation data updated successfully' 
        : 'Presentation data created successfully';
      
      // Update currentData with result
      currentData = result;
      
      // If status is moved to next, redirect to the appropriate stage
      if (status === 'MOVED_TO_NEXT' && browser) {
        setTimeout(() => {
          const nextStage = isPOC === 'yes' ? 'poc' : 'proposal';
          goto(`/sales/pipeline/${organizationId}?stage=${nextStage}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving presentation data:', err);
      error = err.message || 'An error occurred while saving data';
    } finally {
      isSubmitting = false;
    }
  }
  
  // Add followup to the list
  function addFollowup() {
    if (!followupRemark || !followupDate) {
      error = 'Please provide both remark and date for followup';
      return;
    }
    
    followups = [
      ...followups, 
      { 
        id: `temp-${Date.now()}`, 
        remark: followupRemark, 
        followupDate 
      }
    ];
    
    // Clear inputs
    followupRemark = '';
    followupDate = '';
    error = '';
  }
  
  // Remove followup from the list
  async function removeFollowup(index: number) {
    const followup = followups[index];
    
    // If followup has a real ID (not temp-), delete from server
    if (followup.id && !followup.id.startsWith('temp-')) {
      try {
        const response = await fetch(`/api/sales/followup/${followup.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete followup');
        }
      } catch (err: any) {
        console.error('Error deleting followup:', err);
        error = err.message || 'An error occurred while deleting followup';
        return;
      }
    }
    
    // Remove from local list
    followups = followups.filter((_, i) => i !== index);
  }
  

  

</script>

<div class="space-y-6 overflow-y-hidden">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="text-lg font-semibold text-gray-900">Presentation Stage</h2>
    <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {currentData && currentData.id ? 'Edit Presentation' : 'New Presentation'}
    </div>
  </div>

  <!-- Error/Success Messages -->
  {#if error}
    <div class="p-3 rounded-md bg-red-50 text-red-800 flex items-start">
      <AlertCircle class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <p>{error}</p>
    </div>
  {/if}
  
  {#if successMessage}
    <div class="p-3 rounded-md bg-green-50 text-green-800">
      {successMessage}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label for="presentationDate" class="block text-sm font-medium text-gray-700">
          Date of Presentation
        </label>
        <div class="relative">
          <input
            type="date"
            id="presentationDate"
            bind:value={presentationDate}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <CalendarIcon class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Qualification Questions -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Does the Customer Qualify for Next Stage?
          </label>
          <div class="mt-2 space-x-4 flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={isQualified} 
                value="yes" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={isQualified} 
                value="no" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Decision Maker Involved?
          </label>
          <div class="mt-2 space-x-4 flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={decisionMakerInvolved} 
                value="yes" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={decisionMakerInvolved} 
                value="no" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Formal Proposal Requested?
          </label>
          <div class="mt-2 space-x-4 flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={formalProposalRequested} 
                value="yes" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={formalProposalRequested} 
                value="no" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Budget Approved?
          </label>
          <div class="mt-2 space-x-4 flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={budgetApproved} 
                value="yes" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={budgetApproved} 
                value="no" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Proof of Concept (POC) Required?
          </label>
          <div class="mt-2 space-x-4 flex items-center">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={isPOC} 
                value="yes" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Yes</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={isPOC} 
                value="no" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
        
        <div class="space-y-1">
          <label for="caseClosureTimeFrame" class="block text-sm font-medium text-gray-700">
            Case Closure Time Frame
          </label>
          <select
            id="caseClosureTimeFrame"
            bind:value={caseClosureTimeFrame}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Time Frame</option>
            <option value="IMMEDIATE">Immediate ( 30 days)</option>
            <option value="SHORT_TERM">Short Term (1-3 months)</option>
            <option value="MID_TERM">Mid Term (3-6 months)</option>
            <option value="LONG_TERM">Long Term (6+ months)</option>
          </select>
        </div>
      </div>

      <!-- Status Section -->
      <div class="pt-4 border-t border-gray-200">
        <h3 class="text-md font-medium text-gray-900">Presentation Status</h3>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={status} 
                value="IN_PROGRESS" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">In Progress</span>
            </label>
          </div>
          
          <div>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={status} 
                value="MOVED_TO_NEXT" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Move to Next Stage</span>
            </label>
          </div>
          
          <div>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                bind:group={status} 
                value="DROPPED" 
                class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">Dropped</span>
            </label>
          </div>
        </div>
        
        {#if status === 'DROPPED'}
          <div class="mt-4">
            <label for="dropReason" class="block text-sm font-medium text-gray-700">
              Reason for Dropping
            </label>
            <textarea
              id="dropReason"
              bind:value={dropReason}
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Please provide details on why the opportunity was dropped"
            ></textarea>
          </div>
        {/if}
      </div>
    </div>

    <!-- Followups Section -->
    <div class="pt-6 border-t border-gray-200">
      <h3 class="text-md font-medium text-gray-900">Follow-ups</h3>
      
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label for="followupRemark" class="block text-sm font-medium text-gray-700">
            Remark
          </label>
          <input
            type="text"
            id="followupRemark"
            bind:value={followupRemark}
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter follow-up details"
          />
        </div>
        
        <div class="space-y-1">
          <label for="followupDate" class="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="followupDate"
            bind:value={followupDate}
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div class="mt-2">
        <button
          type="button"
          on:click={addFollowup}
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Follow-up
        </button>
      </div>
      
      {#if followups.length > 0}
        <div class="mt-4 overflow-hidden border border-gray-200 rounded-md">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remark
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each followups as followup, index}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {followup.remark}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {followup.followupDate}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      on:click={() => removeFollowup(index)}
                      class="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- File Upload Section -->
    <div class="pt-6 border-t border-gray-200">
      <h3 class="text-md font-medium text-gray-900">Documents</h3>
      
      <div class="mt-4 flex items-center space-x-4">
        <label for="file-upload" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <FileUpload class="h-4 w-4 mr-2" />
          Select File
        </label>
        <input id="file-upload" type="file" class="sr-only" on:change={handleFileSelect} />
        
        {#if selectedFile}
          <div class="text-sm text-gray-700">{selectedFile.name}</div>
          <button
            type="button"
            on:click={uploadFile}
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload
          </button>
        {/if}
      </div>
      
      {#if fileUploadProgress > 0 && fileUploadProgress < 100}
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: {fileUploadProgress}%"></div>
          </div>
          <div class="text-xs text-right mt-1">{fileUploadProgress}%</div>
        </div>
      {/if}
      
<!-- Add this to your component where you display uploaded files -->
{#if uploadedFiles.length > 0}
  <div class="mt-4 overflow-hidden border border-gray-200 rounded-md">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            File Name
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Preview
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Uploaded
          </th>
          <th scope="col" class="relative px-6 py-3">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each uploadedFiles as file}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <a 
                href={file.fileUrl} 
                target="_blank" 
                class="text-blue-600 hover:text-blue-900"
              >
                {file.fileName}
              </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {#if file.fileType && file.fileType.startsWith('image/')}
                <img 
                  src={file.fileUrl} 
                  alt={file.fileName} 
                  class="h-12 w-auto object-contain"
                />
              {:else if file.fileType === 'application/pdf'}
                <span class="text-red-600">PDF Document</span>
              {:else}
                <span class="text-gray-600">File</span>
              {/if}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(file.uploadedAt).toLocaleString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                type="button"
                on:click={() => removeFile(file.id)}
                class="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
    </div>

    <!-- Submit Button -->
    <div class="pt-5 border-t border-gray-200">
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          class="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save class="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Presentation Data'}
        </button>
      </div>
    </div>
  </form>
</div>