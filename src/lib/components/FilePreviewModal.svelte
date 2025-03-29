<!-- src/lib/components/FilePreviewModal.svelte -->
<script lang="ts">
  export let isOpen: boolean = false;
  export let fileUrl: string = '';
  export let fileType: string = '';
  export let fileName: string = '';
  
  function closeModal() {
    isOpen = false;
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">{fileName}</h3>
        <button 
          type="button"
          class="text-gray-400 hover:text-gray-500"
          on:click={closeModal}
        >
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="flex-1 p-6 overflow-auto flex items-center justify-center">
        {#if fileType?.startsWith('image/')}
          <img src={fileUrl} alt={fileName} class="max-w-full max-h-[70vh] object-contain" />
        {:else if fileType === 'application/pdf'}
          <iframe 
            src={fileUrl} 
            title={fileName}
            class="w-full h-[70vh]"
          ></iframe>
        {:else}
          <div class="text-center">
            <p class="mb-4">This file type cannot be previewed directly.</p>
            <button 
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              on:click={() => {
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              Download File
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}