<script lang="ts">
  import { Upload } from 'lucide-svelte';
  let file: File | null = null;

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      file = input.files[0];
    }
  }
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Data Import</h1>
  
  <div class="max-w-xl">
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <Upload class="mx-auto h-12 w-12 text-gray-400" />
      <p class="mt-4 text-sm text-gray-600">
        Upload Excel file with organization data
      </p>
      <input
        type="file"
        accept=".xlsx,.xls"
        class="mt-4"
        on:change={handleFileUpload}
      />
    </div>
    
    {#if file}
      <button 
        class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Process File
      </button>
    {/if}
  </div>
</div>