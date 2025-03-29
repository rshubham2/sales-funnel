<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import CalendarIcon from 'lucide-svelte/icons/calendar';
  import FileUpload from 'lucide-svelte/icons/file-up';
  import Save from 'lucide-svelte/icons/save';
  import AlertCircle from 'lucide-svelte/icons/alert-circle';
  import Edit from 'lucide-svelte/icons/edit';
  import CheckCircle from 'lucide-svelte/icons/check-circle';
  import XCircle from 'lucide-svelte/icons/x-circle';
  import Paperclip from 'lucide-svelte/icons/paperclip';
  import Plus from 'lucide-svelte/icons/plus';
  import Trash from 'lucide-svelte/icons/trash';
  
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
  let formDisabled: boolean = false;
  let editMode: boolean = false;
  
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
      
      // If the status is not IN_PROGRESS, disable the form
      if (currentData.status && currentData.status !== 'IN_PROGRESS') {
        formDisabled = true;
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
          
          // If the status is not IN_PROGRESS, disable the form
          if (data.status && data.status !== 'IN_PROGRESS') {
            formDisabled = true;
          }
        }
      } catch (err) {
        console.error('Error fetching presentation data:', err);
        // Continue with new presentation if data doesn't exist
      }
    }
  });
  
  // Toggle edit mode
  function toggleEditMode() {
    editMode = !editMode;
    formDisabled = !editMode;
  }

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
      
      // Show sweet alert for success
      showSweetAlert('Success!', 'File removed successfully', 'success');
    } catch (err: any) {
      console.error('Error removing file:', err);
      error = err.message || 'An error occurred while removing file';
      showSweetAlert('Error', error, 'error');
    }
  }
  
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile = input.files[0];
    
    // Show preview immediately after selection
    if (browser && selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Create temporary preview
          const tempPreview = document.createElement('div');
          tempPreview.id = 'tempFilePreview';
          tempPreview.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
          tempPreview.style.zIndex = '9999';
          
          const content = document.createElement('div');
          content.className = 'bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl';
          
          const header = document.createElement('div');
          header.className = 'p-4 border-b flex justify-between items-center';
          header.innerHTML = `
            <h3 class="font-medium text-lg">${selectedFile.name}</h3>
            <button type="button" class="text-gray-400 hover:text-gray-500" id="closeTempPreview">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </button>`;
          
          const body = document.createElement('div');
          body.className = 'p-4 overflow-auto max-h-[calc(90vh-100px)]';
          
          const previewContent = document.createElement('div');
          previewContent.className = 'flex items-center justify-center min-h-[300px]';
          
          if (selectedFile.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = e.target.result as string;
            img.className = 'max-w-full max-h-[70vh] object-contain';
            previewContent.appendChild(img);
          } else if (selectedFile.type === 'application/pdf') {
            previewContent.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-red-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg><p class="mt-2">PDF Document - Preview available after upload</p></div>';
          } else {
            previewContent.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><p class="mt-2">File preview unavailable</p></div>';
          }
          
          body.appendChild(previewContent);
          content.appendChild(header);
          content.appendChild(body);
          tempPreview.appendChild(content);
          document.body.appendChild(tempPreview);
          
          document.getElementById('closeTempPreview')?.addEventListener('click', () => {
            document.body.removeChild(tempPreview);
          });
          
          tempPreview.addEventListener('click', (e) => {
            if (e.target === tempPreview) {
              document.body.removeChild(tempPreview);
            }
          });
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }
}

  // Upload file using Base64
  async function uploadFile() {
    if (!selectedFile) {
      showSweetAlert('Warning', 'Please select a file to upload', 'warning');
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
      
      showSweetAlert('Success!', 'File uploaded successfully', 'success');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      error = err.message || 'An error occurred while uploading file';
      showSweetAlert('Error', error, 'error');
    }
  }
  
  async function handleSubmit() {
    try {
      isSubmitting = true;
      error = '';
      successMessage = '';
      
      // Basic validation
      if (status === 'MOVED_TO_NEXT' && isQualified !== 'yes') {
        error = 'Customer must qualify for next stage to move forward';
        isSubmitting = false;
        showSweetAlert('Warning', error, 'warning');
        return;
      }
      
      if (status === 'DROPPED' && !dropReason) {
        error = 'Please provide a reason for dropping';
        isSubmitting = false;
        showSweetAlert('Warning', error, 'warning');
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
      
      // Update currentData with result
      currentData = result;
      
      // Disable form after successful submission
      formDisabled = true;
      editMode = false;
      
      // Show sweet alert for success
      const successMsg = currentData && currentData.id
        ? 'Presentation data updated successfully' 
        : 'Presentation data created successfully';
      
      showSweetAlert('Success!', successMsg, 'success');
      
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
      showSweetAlert('Error', error, 'error');
    } finally {
      isSubmitting = false;
    }
  }
  
  // Add followup to the list
  function addFollowup() {
    if (!followupRemark || !followupDate) {
      error = 'Please provide both remark and date for followup';
      showSweetAlert('Warning', error, 'warning');
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
    
    showSweetAlert('Success', 'Follow-up added', 'success');
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
        showSweetAlert('Error', error, 'error');
        return;
      }
    }
    
    // Remove from local list
    followups = followups.filter((_, i) => i !== index);
    showSweetAlert('Success', 'Follow-up removed', 'success');
  }
  
  // Sweet Alert function
  function showSweetAlert(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') {
    if (typeof window !== 'undefined' && (window as any).Swal) {
      (window as any).Swal.fire({
        title,
        text: message,
        icon: type,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK'
      });
    } else {
      // Fallback if SweetAlert is not available
      alert(`${title}: ${message}`);
    }
  }

  // Add this function to your script section:
function previewFile(file) {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    // Create a temporary preview
    const tempPreview = document.createElement('div');
    tempPreview.id = 'tempFilePreview';
    tempPreview.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl';
    
    const header = document.createElement('div');
    header.className = 'p-4 border-b flex justify-between items-center';
    header.innerHTML = `<h3 class="font-medium text-lg">${file.name}</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500" id="closeTempPreview">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </button>`;
    
    const body = document.createElement('div');
    body.className = 'p-4 overflow-auto max-h-[calc(90vh-100px)]';
    
    const previewContent = document.createElement('div');
    previewContent.className = 'flex items-center justify-center min-h-[300px]';
    
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'max-w-full max-h-[70vh] object-contain';
      previewContent.appendChild(img);
    } else if (file.type === 'application/pdf') {
      previewContent.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-red-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg><p class="mt-2">PDF Document - Preview available after upload</p></div>';
    } else {
      previewContent.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><p class="mt-2">File preview unavailable</p></div>';
    }
    
    body.appendChild(previewContent);
    content.appendChild(header);
    content.appendChild(body);
    tempPreview.appendChild(content);
    document.body.appendChild(tempPreview);
    
    document.getElementById('closeTempPreview').addEventListener('click', () => {
      document.body.removeChild(tempPreview);
    });
    
    tempPreview.addEventListener('click', (e) => {
      if (e.target === tempPreview) {
        document.body.removeChild(tempPreview);
      }
    });
  };
  
  reader.readAsDataURL(file);
}

// // Then update the handleFileSelect function:
// function handleFileSelect(event) {
//   selectedFile = event.target.files[0];
//   if (selectedFile) {
//     previewFile(selectedFile);
//   }
// }

  // Add these functions to the script section
function showPreviewModal(file: any, event?: Event) {
  if (!browser) return;
  
  // Prevent default behavior and stop propagation to avoid triggering form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const modal = document.getElementById('filePreviewModal');
  const content = document.getElementById('previewContent');
  const fileName = document.getElementById('previewFileName');
  
  if (modal && content && fileName) {
    modal.style.display = 'block';
    fileName.textContent = file.fileName;
    
    // Clear previous content
    content.innerHTML = '';
    
    if (file.fileType && file.fileType.startsWith('image/')) {
      // Image preview
      const img = document.createElement('img');
      img.src = file.fileUrl;
      img.alt = file.fileName;
      img.className = 'max-w-full max-h-[70vh] object-contain';
      content.appendChild(img);
    } else if (file.fileType === 'application/pdf') {
      // PDF preview - use object tag instead of iframe for better PDF handling
      const obj = document.createElement('object');
      obj.data = file.fileUrl;
      obj.type = 'application/pdf';
      obj.className = 'w-full h-[70vh] border-0';
      content.appendChild(obj);
    } else {
      // Other file types
      const div = document.createElement('div');
      div.className = 'text-center py-10';
      div.innerHTML = `
        <p class="text-gray-500 mb-4">Preview not available for this file type</p>
        <a href="${file.fileUrl}" target="_blank" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Download File
        </a>
      `;
      content.appendChild(div);
    }
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  // Return false to prevent default behavior
  return false;
}

function closePreviewModal() {
  if (!browser) return;
  
  const modal = document.getElementById('filePreviewModal');
  if (modal) {
    modal.style.display = 'none';
    
    // Re-enable body scrolling
    document.body.style.overflow = '';
  }
}
</script>

<!-- SweetAlert2 CDN -->
<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-sm font-sans">
  <div class="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Presentation Stage</h1>
      <p class="text-gray-500 mt-1">Manage customer presentation details and follow-ups</p>
    </div>
    
    <div class="flex items-center gap-3">
      <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        {currentData && currentData.id ? 'Existing Presentation' : 'New Presentation'}
      </div>
      
      {#if formDisabled && currentData && currentData.id}
        <button 
          on:click={toggleEditMode}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit class="h-4 w-4 mr-2" />
          Edit
        </button>
      {/if}
    </div>
  </div>

  <div class="space-y-8">
    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
    <!-- Basic Information Section -->
    <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
      <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <CalendarIcon class="h-5 w-5 mr-2 text-blue-600" />
        Basic Information
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="presentationDate" class="block text-sm font-medium text-gray-700 mb-1">
            Date of Presentation
          </label>
          <div class="relative rounded-md shadow-sm">
            <input
              type="date"
              id="presentationDate"
              bind:value={presentationDate}
              disabled={formDisabled}
              class="block w-full pl-3 pr-10 py-2.5 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <CalendarIcon class="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div>
          <label for="caseClosureTimeFrame" class="block text-sm font-medium text-gray-700 mb-1">
            Case Closure Time Frame
          </label>
          <select
            id="caseClosureTimeFrame"
            bind:value={caseClosureTimeFrame}
            disabled={formDisabled}
            class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select Time Frame</option>
            <option value="IMMEDIATE">Immediate (≤ 30 days)</option>
            <option value="SHORT_TERM">Short Term (1-3 months)</option>
            <option value="MID_TERM">Mid Term (3-6 months)</option>
            <option value="LONG_TERM">Long Term (6+ months)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Qualification Questions -->
    <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
      <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <CheckCircle class="h-5 w-5 mr-2 text-blue-600" />
        Qualification Criteria
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-1">
              <div class={`h-5 w-5 rounded-full flex items-center justify-center ${isQualified === 'yes' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div class={`h-3 w-3 rounded-full ${isQualified === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Customer Qualification
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={isQualified} 
                    value="yes" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={isQualified} 
                    value="no" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-1">
              <div class={`h-5 w-5 rounded-full flex items-center justify-center ${decisionMakerInvolved === 'yes' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div class={`h-3 w-3 rounded-full ${decisionMakerInvolved === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Decision Maker Involved
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={decisionMakerInvolved} 
                    value="yes" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={decisionMakerInvolved} 
                    value="no" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-1">
              <div class={`h-5 w-5 rounded-full flex items-center justify-center ${formalProposalRequested === 'yes' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div class={`h-3 w-3 rounded-full ${formalProposalRequested === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Formal Proposal Requested
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={formalProposalRequested} 
                    value="yes" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={formalProposalRequested} 
                    value="no" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-1">
              <div class={`h-5 w-5 rounded-full flex items-center justify-center ${budgetApproved === 'yes' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div class={`h-3 w-3 rounded-full ${budgetApproved === 'yes' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Budget Approved
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={budgetApproved} 
                    value="yes" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={budgetApproved} 
                    value="no" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-1">
              <div class={`h-5 w-5 rounded-full flex items-center justify-center ${isPOC === 'yes' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div class={`h-3 w-3 rounded-full ${isPOC === 'yes' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div class="ml-3">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                Proof of Concept Required
              </label>
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={isPOC} 
                    value="yes" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label class="inline-flex items-center">
                  <input 
                    type="radio" 
                    bind:group={isPOC} 
                    value="no" 
                    disabled={formDisabled}
                    class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Status Section -->
<div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
  <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
    <AlertCircle class="h-5 w-5 mr-2 text-blue-600" />
    Presentation Status
  </h2>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          bind:group={status} 
          value="IN_PROGRESS" 
          disabled={formDisabled}
          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
        />
        <span class="ml-2 text-sm text-gray-700">In Progress</span>
      </label>
    </div>
    
    <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          bind:group={status} 
          value="MOVED_TO_NEXT" 
          disabled={formDisabled}
          class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
        />
        <span class="ml-2 text-sm text-gray-700">Move to Next Stage</span>
      </label>
    </div>
    
    <div class="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:shadow">
      <label class="inline-flex items-center">
        <input 
          type="radio" 
          bind:group={status} 
          value="DROPPED" 
          disabled={formDisabled}
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
        disabled={formDisabled}
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
        placeholder="Please provide details on why the opportunity was dropped"
      ></textarea>
    </div>
  {/if}
</div>

<!-- Followups Section -->
<div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
  <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
    <CalendarIcon class="h-5 w-5 mr-2 text-blue-600" />
    Follow-ups
  </h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label for="followupRemark" class="block text-sm font-medium text-gray-700 mb-1">
        Remark
      </label>
      <input
        type="text"
        id="followupRemark"
        bind:value={followupRemark}
        disabled={formDisabled}
        class="block w-full pl-3 pr-10 py-2.5 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        placeholder="Enter follow-up details"
      />
    </div>
    
    <div>
      <label for="followupDate" class="block text-sm font-medium text-gray-700 mb-1">
        Date
      </label>
      <div class="relative rounded-md shadow-sm">
        <input
          type="date"
          id="followupDate"
          bind:value={followupDate}
          disabled={formDisabled}
          class="block w-full pl-3 pr-10 py-2.5 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon class="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
  
  <div class="mt-4">
    <button
      type="button"
      on:click={addFollowup}
      disabled={formDisabled}
      class="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus class="h-4 w-4 mr-2" />
      Add Follow-up
    </button>
  </div>
  
  {#if followups.length > 0}
    <div class="mt-4 overflow-hidden border border-gray-200 rounded-md bg-white">
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
                  disabled={formDisabled}
                  class="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Trash class="h-4 w-4" />
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
<div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
  <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
    <Paperclip class="h-5 w-5 mr-2 text-blue-600" />
    Documents
  </h2>
  
  <div class="mt-4 flex items-center space-x-4">
    <div class="relative">
      <label
        for="file-upload"
        class={`inline-flex items-center px-4 py-2 border ${formDisabled ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'} rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <FileUpload class="h-4 w-4 mr-2" />
        Select File
      </label>
      <input
        id="file-upload"
        type="file"
        on:change={handleFileSelect}
        disabled={formDisabled}
        class="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
    
    {#if selectedFile}
      <div class="text-sm text-gray-700">{selectedFile.name}</div>
      <button
        type="button"
        on:click={uploadFile}
        disabled={formDisabled}
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  
  {#if uploadedFiles.length > 0}
    <div class="mt-4 overflow-hidden border border-gray-200 rounded-md bg-white">
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
              {file.fileName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                  type="button"
                  on:click={(event) => showPreviewModal(file, event)}
                  class="hover:bg-gray-100 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {#if file.fileType && file.fileType.startsWith('image/')}
                  <img 
                    src={file.fileUrl} 
                    alt={file.fileName} 
                    class="h-12 w-auto object-contain"
                  />
                {:else if file.fileType === 'application/pdf'}
                  <span class="text-red-600 flex items-center gap-1">
                    <FileUpload class="h-4 w-4" />
                    PDF Document
                  </span>
                {:else}
                  <span class="text-gray-600 flex items-center gap-1">
                    <FileUpload class="h-4 w-4" />
                    Preview
                  </span>
                {/if}
              </button>
            </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.uploadedAt).toLocaleString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  on:click={() => removeFile(file.id)}
                  disabled={formDisabled}
                  class="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Trash class="h-4 w-4" />
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
<div class="flex justify-end mt-8">
  <button
    type="submit"
    disabled={isSubmitting || formDisabled}
    class="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Save class="h-4 w-4 mr-2" />
    {isSubmitting ? 'Saving...' : 'Save Presentation Data'}
  </button>
</form>

<!-- Add this before the final closing div -->
{#if browser}
  <div class="preview-modal" style="display: none;" id="filePreviewModal">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" on:click|self={() => closePreviewModal()}>
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-medium text-lg" id="previewFileName">File Preview</h3>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-500" 
            on:click={() => closePreviewModal()}
          >
            <XCircle class="h-6 w-6" />
          </button>
        </div>
        <div class="p-4 overflow-auto max-h-[calc(90vh-100px)]">
          <div id="previewContent" class="flex items-center justify-center min-h-[300px]">
            <!-- Preview content will be inserted here -->
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
</div>
</div>