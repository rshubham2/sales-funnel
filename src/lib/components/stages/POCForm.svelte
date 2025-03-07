<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let organizationId: string;
  export let currentData: any = {};
  
  interface FormData {
    totalSites: number;
    productDetail: string;
    POCDuration: string;
    POCType: string;
    businessSites: number;
    businessValue: number;
    MRR: number;
    hardwareSites: number;
    avgHardwareValue: number;
    hardwareValue: number;
    POCStatus: string;
    followUp: {
      date: string;
      notes: string;
    };
  }

  let formData: FormData = {
    totalSites: currentData?.totalSites || 0,
    productDetail: currentData?.productDetail || '',
    POCDuration: currentData?.POCDuration || '',
    POCType: currentData?.POCType || '',
    businessSites: currentData?.businessSites || 0,
    businessValue: currentData?.businessValue || 0,
    MRR: currentData?.MRR || 0,
    hardwareSites: currentData?.hardwareSites || 0,
    avgHardwareValue: currentData?.avgHardwareValue || 0,
    hardwareValue: currentData?.hardwareValue || 0,
    POCStatus: currentData?.POCStatus || '',
    followUp: {
      date: currentData?.followUp?.date || '',
      notes: currentData?.followUp?.notes || ''
    }
  };

  let isSubmitting = false;
  let message = { text: '', type: '' };
  let updateStage = !currentData;
  let activeSection = 'basic'; // Track active section for mobile view

  // Calculate hardware value when sites or average value changes
  $: formData.hardwareValue = formData.hardwareSites * formData.avgHardwareValue;

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'business', label: 'Business Details', icon: '💼' },
    { id: 'hardware', label: 'Hardware Info', icon: '🔧' },
    { id: 'status', label: 'Status & Follow-up', icon: '📅' }
  ];

  onMount(async () => {
    if (!currentData || Object.keys(currentData).length === 0) {
      try {
        const response = await fetch(`/api/sales/poc/${organizationId}`);
        if (response.ok) {
          const data = await response.json();
          formData = {
            ...formData,
            ...data,
            followUp: data.followUp || { date: '', notes: '' }
          };
        }
      } catch (error) {
        console.error('Error fetching POC data:', error);
      }
    }
  });

  async function handleSubmit() {
    isSubmitting = true;
    message = { text: '', type: '' };
    
    try {
      const response = await fetch(`/api/sales/poc/${organizationId}`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          updateStage
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        message = { 
          text: 'POC information saved successfully',
          type: 'success' 
        };
        
        if (updateStage) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        message = { 
          text: `Error: ${errorData.error || 'Unknown error occurred'}`,
          type: 'error' 
        };
      }
    } catch (error) {
      message = { 
        text: `Error: ${error instanceof Error ? error.message : 'Failed to save POC information'}`,
        type: 'error' 
      };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-5xl mx-auto p-4 bg-gray-50 min-h-screen">
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Proof of Concept Details</h2>

    {#if message.text}
      <div 
        transition:fade
        class={`p-4 mb-6 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}
      >
        <span class={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
          {message.type === 'success' ? '✓' : '⚠'}
        </span>
        <span>{message.text}</span>
      </div>
    {/if}

    <!-- Mobile Section Navigation -->
    <div class="md:hidden mb-6">
      <select
        bind:value={activeSection}
        class="w-full p-2 border rounded-lg bg-gray-50"
      >
        {#each sections as section}
          <option value={section.id}>{section.icon} {section.label}</option>
        {/each}
      </select>
    </div>

    <!-- Desktop Section Navigation -->
    <div class="hidden md:flex space-x-4 mb-6">
      {#each sections as section}
        <button
          class={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            activeSection === section.id
              ? 'bg-blue-100 text-blue-800'
              : 'hover:bg-gray-100'
          }`}
          on:click={() => (activeSection = section.id)}
        >
          <span>{section.icon}</span>
          <span>{section.label}</span>
        </button>
      {/each}
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <!-- Basic Info Section -->
      <div class={activeSection === 'basic' ? 'block' : 'hidden md:block'}>
        <div class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Total Sites</label>
              <input
                type="number"
                bind:value={formData.totalSites}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-shadow"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">POC Type</label>
              <input
                type="text"
                bind:value={formData.POCType}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                placeholder="e.g., Technical, Business"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">Product Details</label>
            <textarea
              bind:value={formData.productDetail}
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              rows="3"
              placeholder="Describe the product configuration and requirements..."
            />
          </div>
        </div>
      </div>

      <!-- Business Details Section -->
      <div class={activeSection === 'business' ? 'block' : 'hidden md:block'}>
        <div class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 class="text-lg font-semibold mb-4">Business Details</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Business Sites</label>
              <input
                type="number"
                bind:value={formData.businessSites}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">POC Duration</label>
              <input
                type="text"
                bind:value={formData.POCDuration}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                placeholder="e.g., 3 months"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Business Value</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  bind:value={formData.businessValue}
                  class="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Monthly Recurring Revenue</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  bind:value={formData.MRR}
                  class="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hardware Info Section -->
      <div class={activeSection === 'hardware' ? 'block' : 'hidden md:block'}>
        <div class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 class="text-lg font-semibold mb-4">Hardware Information</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Hardware Sites</label>
              <input
                type="number"
                bind:value={formData.hardwareSites}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Average Hardware Value</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  bind:value={formData.avgHardwareValue}
                  class="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">Total Hardware Value</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                bind:value={formData.hardwareValue}
                class="w-full p-2 pl-8 border rounded-lg bg-gray-50"
                readonly
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Status & Follow-up Section -->
      <div class={activeSection === 'status' ? 'block' : 'hidden md:block'}>
        <div class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 class="text-lg font-semibold mb-4">Status & Follow-up</h3>
          
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">POC Status</label>
            <select
              bind:value={formData.POCStatus}
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="">Select Status</option>
              <option value="Not Started">⭕ Not Started</option>
              <option value="In Progress">🔄 In Progress</option>
              <option value="Completed">✅ Completed</option>
              <option value="Cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Follow-up Date</label>
              <input
                type="date"
                bind:value={formData.followUp.date}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">Follow-up Notes</label>
              <textarea
                bind:value={formData.followUp.notes}
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                rows="2"
                placeholder="Add any follow-up notes or reminders..."
              />
            </div>
          </div>
        </div>
      </div>

      {#if !currentData}
        <div class="bg-blue-50 p-4 rounded-lg">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              bind:checked={updateStage}
              class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            >
            <span class="text-sm text-blue-800">Update organization stage to POC</span>
          </label>
        </div>
      {/if}

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <svg 
            class="animate-spin h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              class="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              stroke-width="4"
            />
            <path 
              class="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Saving...</span>
        {:else}
          <span>Save POC Details</span>
        {/if}
      </button>
    </form>
  </div>
</div>

<style>
  /* Smooth transitions */
  :global(.transition-colors) {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  /* Custom scrollbar for textareas */
  textarea {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #EDF2F7;
  }

  textarea::-webkit-scrollbar {
    width: 8px;
  }

  textarea::-webkit-scrollbar-track {
    background: #EDF2F7;
    border-radius: 4px;
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 4px;
    border: 2px solid #EDF2F7;
  }

  /* Focus styles */
  input:focus, textarea:focus, select:focus {
    outline: none;
  }

  /* Custom checkbox styles */
  input[type="checkbox"] {
    accent-color: #2563EB;
  }

  /* Disable number input spinners */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>