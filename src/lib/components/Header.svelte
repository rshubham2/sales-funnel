 <!-- src/lib/components/Header.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { Bell, User, ChevronDown } from 'lucide-svelte';
  
  let isProfileDropdownOpen = false;
</script>

<header class="bg-gray-300 shadow-sm fixed top-0 w-full z-30 h-14">
  <div class="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-full">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img src="vc2-Photoroom.png" alt="Logo" class="h-12 w-auto" />
        </div>
      </div>

      <div class="flex items-center gap-4">
        {#if !$page.data.user}
          <a href="/login" class="text-gray-700 hover:text-gray-900 px-4 py-3 rounded-md text-sm font-medium">
            Login
          </a>
          <a href="/register" class="bg-sky-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-sky-800">
            Register
          </a>
        {:else}
          <div class="flex items-center gap-4">
            <button class="text-gray-500 hover:text-gray-900">
              <Bell size={20} />
            </button>
            <div class="relative">
              <button
                class="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                on:click={() => isProfileDropdownOpen = !isProfileDropdownOpen}
              >
                <img src="favicon.png" alt="Profile" class="h-8 w-8 rounded-full" />
                <span class="hidden md:block">User Name</span>
                <ChevronDown size={16} />
              </button>

              {#if isProfileDropdownOpen}
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <a href="/profile" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
                  <a href="/settings" class="block px-4 py-2 hover:bg-gray-100">Settings</a>
                  <form action="/logout" method="POST">
                    <button type="submit" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Logout
                    </button>
                  </form>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>
