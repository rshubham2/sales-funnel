<!-- src/lib/components/Header.svelte -->
<script lang="ts">
  import '../styles/app.css'
  import { User as UserIcon, Settings, Home, Calendar } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let showUserMenu = false;
  
  $: user = $page.data.user;

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  function navigateTo(path: string) {
    showUserMenu = false;
    goto(path);
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      showUserMenu = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      showUserMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<header class="bg-gray-300 shadow-sm z-10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-14">
      <div class="flex items-center space-x-4">
        <button 
          on:click={() => navigateTo('/dashboard')}
          class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Home class="h-5 w-5 text-gray-600" />
          <span class="text-gray-700">Dashboard</span>
        </button>

      </div>
      <div class="flex items-center">
        <div class="relative user-menu">
          <button 
            on:click={toggleUserMenu} 
            class="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <img 
              class="h-8 w-8 rounded-full border-2 border-gray-200"
              src={user?.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
              alt="User profile"
            >
            <span class="text-gray-700 hidden sm:inline-block">{user?.name || user?.username || 'User'}</span>
          </button>
          
          {#if showUserMenu}
            <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
              <div class="p-6 bg-gray-50 border-b flex items-center">
                <img 
                  class="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md" 
                  src={user?.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                  alt="User profile"
                >
                <div class="ml-4">
                  <h3 class="text-xl font-semibold text-gray-800">{user?.name || user?.username || 'User'}</h3>
                  <p class="text-sm text-gray-500">{user?.email || 'No email provided'}</p>
                </div>
              </div>
              
              <div class="py-2">
                <button 
                  on:click={() => navigateTo('/profile')}
                  class="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon class="h-5 w-5 mr-3 text-gray-500" />
                  <span>View Profile</span>
                </button>
                <button 
                  on:click={() => navigateTo('/settings')}
                  class="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings class="h-5 w-5 mr-3 text-gray-500" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>

<slot />