<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { Briefcase, CheckSquare, Calendar, BarChart2, ChevronLeft, ChevronRight, LogOut, User, ReceiptIndianRupee, Truck } from 'lucide-svelte';
  import '../styles/app.css'
  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';
  import Swal from 'sweetalert2';

  // Create a store for the loading state
  const isLoading = writable(false);

  let isMinimized = false;
  let showExportModal = false;

  const toggleSidebar = () => {
    isMinimized = !isMinimized;
  };

  $: currentPage = $page.url.pathname.split('/')[1] || 'Home';

  const menuItems = [
  { icon: CheckSquare, label: 'Dashboard', href: '/' },
];

  const handleNavigation = (href: string) => {
      isLoading.set(true);
      goto(href).then(() => {
        isLoading.set(false);
      });
    
  };

</script>

<aside class="bg-sky-950 text-white h-screen flex flex-col transition-all duration-300 ease-in-out {isMinimized ? 'w-14' : 'w-48'} shadow-md z-20">
  <div class="p-3 flex items-center justify-between h-14 bg-sky-200">
    {#if !isMinimized}
      <h2 class="text-lg font-semibold ">
        <a href="/"><img src="vc2-Photoroom.png" alt="logo" class="h-8" /></a>
      </h2>
    {/if}
  </div>

  <nav class="flex-1 overflow-y-auto">
    <ul class="space-y-1 p-2">
      {#if $page.data.user.role === 'ADMIN'}
      <li>
        <a href="/admin"
          on:click|preventDefault={() => handleNavigation('/admin')}
          class="flex items-center p-2 rounded-md hover:bg-sky-800 transition-colors duration-200 {$page.url.pathname === '/admin' ? 'bg-sky-900' : ''}"
        >
          <User size={20} />
          {#if !isMinimized}
            <span class="ml-3 text-sm">Admin</span>
          {/if}
        </a>
      </li>
      {/if}
      {#each menuItems as item}
        <li>
          <a href={item.href}
            on:click|preventDefault={() => handleNavigation(item.href)}
            class="flex items-center p-2 rounded-md hover:bg-sky-800 transition-colors duration-200 {$page.url.pathname === item.href ? 'bg-sky-900' : ''}"
          >
            <svelte:component this={item.icon} size={20} />
            {#if !isMinimized}
              <span class="ml-3 text-sm">{item.label}</span>
            {/if}
          </a>
        </li>
      {/each}
  {#if $page.data.user.role === 'ADMIN'}
    <li>
      <button
        on:click={() => handleNavigation('api/export-data')}
        class="flex items-center p-2 rounded-md hover:bg-sky-800 transition-colors duration-200 w-full text-left"
      >
        <BarChart2 size={20} />
        {#if !isMinimized}
          <span class="ml-3 text-sm">Export Data</span>
        {/if}
      </button>
    </li>
  {/if}
      
      {#if $page.data.user}
        <form action="/logout" method="POST" use:enhance={() => {
          return async ({result}) => {
            invalidateAll()
            await applyAction(result)
          }
        }}>
          <button type="submit" class="flex items-center p-2 rounded-md hover:bg-sky-800 transition-colors duration-200">
            <LogOut size={20} />
              {#if !isMinimized}
                <span class="ml-3 text-sm">LogOut</span>
              {/if}
          </button>
        </form>
      {/if}
    </ul>
  </nav>

  <button 
    on:click={toggleSidebar} 
    class="p-2 bg-sky-950 hover:bg-sky-800 transition-colors duration-200 flex justify-center items-center"
    aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
  >
    <svelte:component this={isMinimized ? ChevronRight : ChevronLeft} size={20} />
  </button>
</aside>

{#if $isLoading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="loader"></div>
  </div>
{/if}


<style>
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

