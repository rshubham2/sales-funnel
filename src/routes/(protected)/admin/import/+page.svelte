<!-- src/routes/admin/import/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import * as XLSX from 'xlsx';

    let excelFile: File | null = null;
  let parsedData: Array<{
    organizationName: string;
    organizationAddress: string;
    organizationWebsite: string;
    contactName: string;
    contactDesignation: string;
    contactMobile: string;
    contactDepartment: string;
    contactEmail: string;
  }> = [];

    let isSubmitting = false;
  let submitError: string | null = null;
  let submitSuccess = false;

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      excelFile = input.files[0];
      parseExcelFile();
    }
  }

  function parseExcelFile() {
    if (!excelFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Assume first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON, assuming specific column headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Validate and transform data
      parsedData = jsonData.slice(1).map(row => ({
        organizationName: row[0],
        organizationAddress: row[1],
        organizationWebsite: row[2] || '',
        contactName: row[3],
        contactDesignation: row[4],
        contactMobile: row[5],
        contactDepartment: row[6],
        contactEmail: row[7]
      })).filter(item => item.organizationName && item.contactName);
    };
    reader.readAsArrayBuffer(excelFile);
  }

  function downloadTemplate() {
    // Create a worksheet
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

  let organizationName = '';
  let organizationAddress = '';
  let organizationWebsite = '';
  
  let contactName = '';
  let contactDesignation = '';
  let contactMobile = '';
  let contactDepartment = '';
  let contactEmail = '';
</script>

<div class="container mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Import Prospects</h1>

  <div class="bg-white p-8 rounded-lg shadow-md mb-6">
    <h2 class="text-xl font-semibold mb-4">Bulk Upload</h2>
    
    <div class="mb-4">
      <button 
        on:click={downloadTemplate}
        class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mr-4"
      >
        Download Template
      </button>
      
      <input 
        type="file" 
        accept=".xlsx, .xls"
        on:change={handleFileUpload}
        class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>

    {#if parsedData.length > 0}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Organization Name</th>
              <th class="border p-2">Contact Name</th>
              <th class="border p-2">Email</th>
              <th class="border p-2">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {#each parsedData as item}
              <tr>
                <td class="border p-2">{item.organizationName}</td>
                <td class="border p-2">{item.contactName}</td>
                <td class="border p-2">{item.contactEmail}</td>
                <td class="border p-2">{item.contactMobile}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <form 
        method="POST" 
        action="?/bulkImport"
        use:enhance={() => {
          isSubmitting = true;
          submitError = null;
          submitSuccess = false;

          return async ({ result, update }) => {
            isSubmitting = false;
            
            if (result.type === 'success') {
              submitSuccess = true;
              parsedData = []; // Clear parsed data
            } else if (result.type === 'failure') {
              submitError = result.data?.message || 'An error occurred';
            }

            update();
          };
        }}
        class="mt-4"
      >
        <input 
          type="hidden" 
          name="prospects" 
          value={JSON.stringify(parsedData)} 
        />
        <button 
          type="submit" 
          disabled={isSubmitting || parsedData.length === 0}
          class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Importing...' : `Import ${parsedData.length} Prospects`}
        </button>
      </form>
    {/if}

    {#if submitError}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
        {submitError}
      </div>
    {/if}

    {#if submitSuccess}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
        Prospects imported successfully!
      </div>
    {/if}
  </div>

  <form 
    method="POST" 
    action="?/manualImport"
    use:enhance={() => {
      isSubmitting = true;
      submitError = null;
      submitSuccess = false;

      return async ({ result, update }) => {
        isSubmitting = false;
        
        if (result.type === 'success') {
          submitSuccess = true;
          // Reset form fields
          organizationName = '';
          organizationAddress = '';
          organizationWebsite = '';
          contactName = '';
          contactDesignation = '';
          contactMobile = '';
          contactDepartment = '';
          contactEmail = '';
        } else if (result.type === 'failure') {
          submitError = result.data?.message || 'An error occurred';
        }

        update();
      };
    }}
    class="space-y-6 bg-white p-8 rounded-lg shadow-md"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Organization Details</h2>
        <div>
          <label for="organizationName" class="block mb-2">Organization Name</label>
          <input 
            type="text" 
            id="organizationName" 
            name="organizationName" 
            bind:value={organizationName}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="organizationAddress" class="block mb-2">Address</label>
          <input 
            type="text" 
            id="organizationAddress" 
            name="organizationAddress" 
            bind:value={organizationAddress}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="organizationWebsite" class="block mb-2">Website</label>
          <input 
            type="text" 
            id="organizationWebsite" 
            name="organizationWebsite" 
            bind:value={organizationWebsite}
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Contact Details</h2>
        <div>
          <label for="contactName" class="block mb-2">Contact Name</label>
          <input 
            type="text" 
            id="contactName" 
            name="contactName" 
            bind:value={contactName}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="contactDesignation" class="block mb-2">Designation</label>
          <input 
            type="text" 
            id="contactDesignation" 
            name="contactDesignation" 
            bind:value={contactDesignation}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="contactMobile" class="block mb-2">Mobile Number</label>
          <input 
            type="tel" 
            id="contactMobile" 
            name="contactMobile" 
            bind:value={contactMobile}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="contactDepartment" class="block mb-2">Department</label>
          <input 
            type="text" 
            id="contactDepartment" 
            name="contactDepartment" 
            bind:value={contactDepartment}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label for="contactEmail" class="block mb-2">Email</label>
          <input 
            type="email" 
            id="contactEmail" 
            name="contactEmail" 
            bind:value={contactEmail}
            required 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>

    {#if submitError}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {submitError}
      </div>
    {/if}

    {#if submitSuccess}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        Prospect imported successfully!
      </div>
    {/if}

    <div class="flex justify-end">
      <button 
        type="submit" 
        disabled={isSubmitting}
        class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Importing...' : 'Import Prospect'}
      </button>
    </div>
  </form>
</div>