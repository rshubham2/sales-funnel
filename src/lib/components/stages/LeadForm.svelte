<script lang="ts">
  import { onMount } from 'svelte';
  
  export let organizationId: string;
  export let currentData: any = {};
  
  let isLoading = false;
  let isEditing = false;
  let showSuccessToast = false;
  let errors: Record<string, string> = {};
  
  const verticalOptions = [
    'Banking',
    'Retail',
    'Warehouse',
    'Education',
    'QSR',
    'Manufacturing',
    'Government Tenders'
  ];
  
  const categoryOptions = [
    { value: 'High Priority', color: 'bg-red-100 text-red-800' },
    { value: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Low Priority', color: 'bg-green-100 text-green-800' }
  ];
  
  let formData = {
    vertical: currentData?.vertical || verticalOptions[0],
    totalLocations: currentData?.totalLocations ?? 0,
    businessExpectationsCount: currentData?.businessExpectationsCount ?? 0,
    businessExpectationsValue: currentData?.businessExpectationsValue ?? 0,
    businessExpectationsMRR: currentData?.businessExpectationsMRR ?? 0,
    category: currentData?.category || categoryOptions[1].value,
  };

  let originalData = { ...formData };

  onMount(() => {
    isEditing = !currentData?.id;
  });

  function validateForm() {
    errors = {};
    
    // Only check for negative values, allow zero
    if (formData.totalLocations < 0) {
      errors.totalLocations = 'Total locations cannot be negative';
    }
    
    if (formData.businessExpectationsCount < 0) {
      errors.businessExpectationsCount = 'Business expectations count cannot be negative';
    }
    
    if (formData.businessExpectationsValue < 0) {
      errors.businessExpectationsValue = 'Business value cannot be negative';
    }
    
    if (formData.businessExpectationsMRR < 0) {
      errors.businessExpectationsMRR = 'MRR cannot be negative';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      isLoading = true;
      const response = await fetch(`/api/sales/lead/${organizationId}`, {
        method: currentData?.id ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save lead information');
      }

      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      isEditing = false;
      originalData = { ...formData };
    } catch (error) {
      errors.submit = error instanceof Error ? error.message : 'Unknown error occurred';
    } finally {
      isLoading = false;
    }
  }

  function toggleEdit() {
    if (isEditing && hasChanges && !confirm('Discard changes?')) {
      return;
    }
    if (!isEditing) {
      formData = { ...originalData };
      errors = {};
    }
    isEditing = !isEditing;
  }

  $: hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
</script>

<div class="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
  <div class="p-8 border-b border-gray-200">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Lead Information</h2>
      {#if currentData?.id}
        <button
          on:click={toggleEdit}
          class="flex items-center px-4 py-2 rounded-lg {isEditing ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'} hover:bg-opacity-80 transition-colors"
          type="button"
        >
          <span class="material-icons mr-2">{isEditing ? 'close' : 'edit'}</span>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      {/if}
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="form-group">
          <label for="vertical" class="text-sm font-semibold text-gray-700">Vertical</label>
          <select
            id="vertical"
            bind:value={formData.vertical}
            class="mt-2 w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={!isEditing}
          >
            {#each verticalOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>

<div class="form-group">
  <label for="totalLocations" class="text-sm font-semibold text-gray-700">Total No. Of Locations</label>
  <input
    id="totalLocations"
    type="number"
    bind:value={formData.totalLocations}
    class="mt-2 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    disabled={!isEditing}
    min="0"
    placeholder="0"
  />
  {#if errors.totalLocations}
    <p class="mt-1 text-sm text-red-600">{errors.totalLocations}</p>
  {/if}
  <p class="mt-1 text-xs text-gray-500">Enter 0 if no locations</p>
</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="form-group">
  <label for="businessExpectationsCount" class="text-sm font-semibold text-gray-700">
    Total Business Expectations in Numbers
  </label>
  <input
    id="businessExpectationsCount"
    type="number"
    bind:value={formData.businessExpectationsCount}
    class="mt-2 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    disabled={!isEditing}
    min="0"
    placeholder="0"
  />
  {#if errors.businessExpectationsCount}
    <p class="mt-1 text-sm text-red-600">{errors.businessExpectationsCount}</p>
  {/if}
  <p class="mt-1 text-xs text-gray-500">Enter 0 if no expectations</p>
</div>

<div class="form-group">
  <label for="businessExpectationsValue" class="text-sm font-semibold text-gray-700">
    Total Business Expectations in Value (₹)
  </label>
  <div class="relative mt-2">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
    <input
      id="businessExpectationsValue"
      type="number"
      bind:value={formData.businessExpectationsValue}
      class="w-full p-3 pl-8 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      disabled={!isEditing}
      min="0"
      step="any"
      placeholder="0"
    />
    {#if errors.businessExpectationsValue}
      <p class="mt-1 text-sm text-red-600">{errors.businessExpectationsValue}</p>
    {/if}
  </div>
  <p class="mt-1 text-xs text-gray-500">Enter 0 if no value expected</p>
</div>

<div class="form-group">
  <label for="businessExpectationsMRR" class="text-sm font-semibold text-gray-700">
    Total Business Expectations in MRR (₹)
  </label>
  <div class="relative mt-2">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
    <input
      id="businessExpectationsMRR"
      type="number"
      bind:value={formData.businessExpectationsMRR}
      class="w-full p-3 pl-8 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      disabled={!isEditing}
      min="0"
      step="any"
      placeholder="0"
    />
    {#if errors.businessExpectationsMRR}
      <p class="mt-1 text-sm text-red-600">{errors.businessExpectationsMRR}</p>
    {/if}
  </div>
  <p class="mt-1 text-xs text-gray-500">Enter 0 if no MRR expected</p>
</div>
      </div>

      <div class="form-group">
        <label for="category" class="text-sm font-semibold text-gray-700">Customer Category</label>
        <select
          id="category"
          bind:value={formData.category}
          class="mt-2 w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!isEditing}
        >
          {#each categoryOptions as option}
            <option value={option.value} class={option.color}>{option.value}</option>
          {/each}
        </select>
      </div>

      {#if errors.submit}
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700">{errors.submit}</p>
        </div>
      {/if}

      {#if isEditing}
        <div class="flex justify-end space-x-4 pt-6">
          <button
            type="submit"
            class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50"
            disabled={isLoading || !hasChanges}
          >
            {#if isLoading}
              <div class="animate-spin mr-2">
                <span class="material-icons">refresh</span>
              </div>
            {/if}
            {currentData?.id ? 'Update' : 'Save'} Lead Information
          </button>
        </div>
      {/if}
    </form>
  </div>
</div>

{#if showSuccessToast}
  <div class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
    Lead information saved successfully
  </div>
{/if}

<style>
  .animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-group {
    @apply flex flex-col;
  }
</style>