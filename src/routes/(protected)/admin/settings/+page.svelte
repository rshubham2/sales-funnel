<script lang="ts">
  let settings = {
    companyName: 'My Company',
    emailNotifications: true,
    defaultPOCDuration: 30,
    currency: 'INR'
  };
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Settings</h1>
  
  <div class="max-w-xl bg-white rounded-lg shadow p-6">
    <form class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          type="text"
          bind:value={settings.companyName}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Default POC Duration (days)
        </label>
        <input
          type="number"
          bind:value={settings.defaultPOCDuration}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div class="flex items-center">
        <input
          type="checkbox"
          bind:checked={settings.emailNotifications}
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label class="ml-2 block text-sm text-gray-900">
          Enable email notifications
        </label>
      </div>

      <button 
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  </div>
</div>