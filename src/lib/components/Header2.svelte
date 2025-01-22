<script lang="ts">
  import '../styles/app.css'
  import { User as UserIcon, LogOut } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let showUserMenu = false;
  $: user = $page.data.user;

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  async function handleLogout() {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await goto('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      showUserMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="bg-white border-b px-6 py-3">
  <div class="flex justify-between items-center">
    <h1 class="text-xl font-semibold text-gray-800">Dashboard</h1>
    
    <div class="relative user-menu">
      <button 
        on:click={toggleUserMenu}
        class="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
      >
        <img 
          class="h-8 w-8 rounded-full object-cover"
          src={user?.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"} 
          alt="Profile"
        >
        <span class="text-gray-700">{user?.username || 'User'}</span>
      </button>

      {#if showUserMenu}
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden border">
          <button 
            on:click={handleLogout}
            class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut class="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<slot />