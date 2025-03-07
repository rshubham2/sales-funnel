<!-- src/routes/admin/import/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import * as XLSX from 'xlsx';
  import { draw, fade, slide, crossfade } from 'svelte/transition';
  import { toasts } from '$lib/stores/toast2';
  import Toast from '$lib/components/Toast.svelte';

  type ParsedData = {
    organizationName: string;
    organizationAddress: string;
    organizationWebsite: string;
    contactName: string;
    contactDesignation: string;
    contactMobile: string;
    contactDepartment: string;
    contactEmail: string;
  };

    function handleManualImport() {
    isSubmitting = true;
    submitError = null;
    submitSuccess = false;

    return async ({ result, update }: { result: any, update: () => void }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        submitSuccess = true;
        toasts.add('Prospect imported successfully!');
        // Reset form fields
        organizationName = '';
        organizationAddress = '';
        // ... reset other fields ...
      } else if (result.type === 'failure') {
        submitError = result.data?.message || 'An error occurred';
        toasts.add(result.data?.message || 'Failed to import prospect', 'error');
      }
      await update();
    };
  }

  function handleBulkImport() {
    isSubmitting = true;
    submitError = null;
    submitSuccess = false;

    return async ({ result, update }: { result: any, update: () => void }) => {
      isSubmitting = false;
      if (result.type === 'success') {
        const { imported, duplicates, errors, total } = result.data.results;
        toasts.add(
          `Successfully imported ${imported} out of ${total} prospects. ${duplicates} duplicates found. ${errors} errors occurred.`
        );
        parsedData = [];
      } else if (result.type === 'failure') {
        submitError = result.data?.message || 'An error occurred';
        toasts.add(result.data?.message || 'Failed to import prospects', 'error');
      }
      await update();
    };
  }

  let activeTab = 'bulk';
  let dragActive = false;
  let excelFile: File | null = null;
  let parsedData: ParsedData[] = [];
  let isSubmitting = false;
  let submitError: string | null = null;
  let submitSuccess = false;

  // Form data for manual entry
  let organizationName = '';
  let organizationAddress = '';
  let organizationWebsite = '';
  let contactName = '';
  let contactDesignation = '';
  let contactMobile = '';
  let contactDepartment = '';
  let contactEmail = '';

  function handleDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = event.type === 'dragenter' || event.type === 'dragover';
  }

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toasts.add('File size exceeds 5MB limit', 'error');
    return false;
  }
  return true;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  dragActive = false;

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (validateFile(file)) {
      excelFile = file;
      parseExcelFile();
    }
  }
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (validateFile(file)) {
      excelFile = file;
      parseExcelFile();
    }
  }
}

function parseExcelFile() {
  if (!excelFile) return;

  // Check file extension
  const validExtensions = ['.xlsx', '.xls'];
  const fileExtension = '.' + excelFile.name.split('.').pop()?.toLowerCase();
  
  if (!validExtensions.includes(fileExtension)) {
    toasts.add('Please upload a valid Excel file (.xlsx or .xls)', 'error');
    clearUpload();
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      if (workbook.SheetNames.length === 0) {
        throw new Error('The Excel file is empty');
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Validate header row
      const expectedHeaders = [
        'Organization Name',
        'Organization Address',
        'Organization Website',
        'Contact Name',
        'Contact Designation',
        'Contact Mobile',
        'Contact Department',
        'Contact Email'
      ];

      const headerRow = jsonData[0] as string[];
      
      if (!headerRow || headerRow.length !== expectedHeaders.length) {
        throw new Error('Invalid file format: Missing or incorrect headers');
      }

      const hasCorrectHeaders = expectedHeaders.every((header, index) => 
        headerRow[index]?.toLowerCase().trim() === header.toLowerCase()
      );

      if (!hasCorrectHeaders) {
        throw new Error('Invalid file format: Headers do not match the template');
      }

      // Validate data rows
       data = jsonData.slice(1).map(row => ({    
        organizationName: row[0],
        organizationAddress: row[1],
        organizationWebsite: row[2] || '',
        contactName: row[3],
        contactDesignation: row[4],
        contactMobile: row[5],
        contactDepartment: row[6],
        contactEmail: row[7]
      }));

      // Check for required fields in each row
      const invalidRows = data.filter((row, index) => {
        const requiredFields = [
          'organizationName',
          'organizationAddress',
          'contactName',
          'contactDesignation',
          'contactMobile',
          'contactDepartment',
          'contactEmail'
        ];
        
        return requiredFields.some(field => !row[field]);
      });

      if (invalidRows.length > 0) {
        throw new Error(`Missing required fields in ${invalidRows.length} rows`);
      }

      parsedData = data.filter(item => item.organizationName && item.contactName);

      if (parsedData.length === 0) {
        throw new Error('No valid data found in the file');
      }

      toasts.add(`Successfully parsed ${parsedData.length} prospects`, 'success');

    } catch (error) {
      toasts.add(error.message || 'Failed to parse Excel file', 'error');
      clearUpload();
    }
  };

  reader.onerror = () => {
    toasts.add('Error reading the file', 'error');
    clearUpload();
  };

  reader.readAsArrayBuffer(excelFile);
}

  function downloadTemplate() {
    const data = [
      [
        'Organization Name', 
        'Organization Address', 
        'Organization Website', 
        'Contact Name', 
        'Contact Designation', 
        'Contact Mobile', 
        'Contact Department', 
        'Contact Email'
      ]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospects');
    
    XLSX.writeFile(workbook, 'prospect_template.xlsx');
  }

  function clearUpload() {
    parsedData = [];
    excelFile = null;
  }
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <h1 class="text-3xl font-bold mb-8">Import Prospects</h1>

  <div class="space-y-6">
    <!-- Tab buttons -->
    <div class="border-b border-gray-200">
      <div class="flex space-x-8">
        <button
          class="py-2 px-4 -mb-px {activeTab === 'bulk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
          on:click={() => activeTab = 'bulk'}
        >
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            <span>Bulk Import</span>
          </div>
        </button>
        <button
          class="py-2 px-4 -mb-px {activeTab === 'manual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
          on:click={() => activeTab = 'manual'}
        >
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Manual Entry</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Tab content -->
    {#if activeTab === 'bulk'}
      <div class="bg-white rounded-lg shadow-md p-8" >
        <div
          class="border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out
            {dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}"
          on:dragenter={handleDrag}
          on:dragover={handleDrag}
          on:dragleave={handleDrag}
          on:drop={handleDrop}
        >
          {#if parsedData.length === 0}
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <div class="mt-4">
                <label class="cursor-pointer">
                  <span class="text-blue-500 font-medium hover:text-blue-600">Click to upload</span>
                  <input
                    type="file"
                    class="hidden"
                    accept=".xlsx,.xls"
                    on:change={handleFileUpload}
                  />
                </label>
                <span class="text-gray-500"> or drag and drop</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Excel files only (xlsx, xls)</p>
              <button 
                class="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
                on:click={downloadTemplate}
              >
                Download Template
              </button>
            </div>
          {:else}
            <div class="space-y-4">
              <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each parsedData as item}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm">{item.organizationName}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">{item.contactName}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">{item.contactEmail}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">{item.contactMobile}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>

              <div class="flex justify-between items-center">
                <button 
                  class="text-sm text-gray-500 hover:text-gray-700"
                  on:click={clearUpload}
                >
                  Clear and upload new file
                </button>
                <form
                  method="POST"
                  action="?/bulkImport"
                  use:enhance={handleBulkImport}
                >
                  <input type="hidden" name="prospects" value={JSON.stringify(parsedData)}>
                  <button
                    type="submit"
                    class="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || parsedData.length === 0}
                  >
                    {isSubmitting ? 'Importing...' : `Import ${parsedData.length} Prospects`}
                  </button>
                </form>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-md p-8" transition:fade>
        <form
          method="POST"
          action="?/manualImport"
          use:enhance={handleManualImport}

          class="space-y-8"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Organization Details -->
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-700">Organization Details</h3>
              <div class="space-y-4">
                <div>
                  <label for="organizationName" class="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    bind:value={organizationName}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="organizationAddress" class="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="organizationAddress"
                    name="organizationAddress"
                    bind:value={organizationAddress}
                    required
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label for="organizationWebsite" class="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="organizationWebsite"
                    name="organizationWebsite"
                    bind:value={organizationWebsite}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Contact Details -->
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-700">Contact Details</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="contactName" class="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      bind:value={contactName}
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label for="contactDepartment" class="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      id="contactDepartment"
                      name="contactDepartment"
                      bind:value={contactDepartment}
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label for="contactDesignation" class="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="contactDesignation"
                    name="contactDesignation"
                    bind:value={contactDesignation}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    bind:value={contactEmail}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label for="contactMobile" class="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="contactMobile"
                    name="contactMobile"
                    bind:value={contactMobile}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {#if submitError}
            <div class="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md" transition:fade>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm">{submitError}</p>
            </div>
          {/if}

          {#if submitSuccess}
            <div class="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md" transition:fade>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm">Prospect imported successfully!</p>
            </div>
          {/if}

          <div class="flex justify-end">
            <button
              type="submit"
              class="px-6 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Importing...' : 'Import Prospect'}
            </button>
          </div>
        </form>
      </div>
    {/if}
  </div>
<Toast />
</div>