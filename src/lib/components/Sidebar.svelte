 <!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { 
    Briefcase, 
    CheckSquare, 
    ChevronLeft, 
    ChevronRight, 
    LogOut, 
    User,
    Building2,
    GitBranch,
    BarChart3,
    Settings
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  export let isMinimized = false;

  const toggleSidebar = () => {
    isMinimized = !isMinimized;
  };

  const menuItems = [
    { icon: CheckSquare, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Organizations', href: '/admin/organizations' },
    { icon: GitBranch, label: 'Sales Pipeline', href: '/admin/pipeline' },
    { icon: Briefcase, label: 'Team', href: '/admin/team' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' }
  ];

  const handleNavigation = (href: string) => {
    goto(href);
  };
</script>

{#if $page.data.user}
  <aside class="bg-sky-950 text-white flex flex-col transition-all duration-300 ease-in-out fixed left-0 top-12 bottom-10 {isMinimized ? 'w-14' : 'w-48'} shadow-md z-20">
    <nav class="flex-1 overflow-y-auto">
      <ul class="space-y-1 p-2">
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
{/if}
