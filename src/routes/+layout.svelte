 <!-- src/routes/+layout.svelte -->
<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Loader from '$lib/components/Load.svelte';
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import '../app.css';

  let isMinimized = false;
</script>

<svelte:head>
  <title>VC Tech - Sales</title>
</svelte:head>

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

{#if $navigating}
  <Loader />
{/if}

<style lang="postcss">
  :global(body) {
    @apply overflow-x-hidden;
  }
</style>