 <!-- src/routes/+layout.svelte -->
<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Loader from '$lib/components/Load.svelte';
  import Header2 from '$lib/components/Header2.svelte';
  import '../app.css';
  import Sidebar2 from '$lib/components/Sidebar2.svelte';
  import Footer2 from '$lib/components/Footer2.svelte';
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import '../app.css';

  let isMinimized = false;
</script>

<svelte:head>
  <title>VC Tech - Sales</title>
</svelte:head>

{#if !$page.data.user}
<div class="min-h-screen bg-gray-100">
  <Header />
  <Sidebar bind:isMinimized />
  
  <main class="pt-12 pb-12 transition-all duration-300 ease-in-out {$page.data.user ? (isMinimized ? 'ml-14' : 'ml-48') : 'ml-0'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </div>
  </main>
  
  <Footer />
</div>
{/if}

{#if $navigating && $page.data.user}
  <Loader />
{/if}

{#if $page.data.user}
<div class="flex h-screen bg-gray-50">
        <Sidebar2 />
  <div class="flex flex-col flex-1 overflow-hidden">
    
        <Header2 />
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
      <slot />
    </main>
    
    <Footer2 />
    
  </div>
</div>
{/if}

<style lang="postcss">
  :global(body) {
    @apply overflow-x-hidden;
  }
</style>