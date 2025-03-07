<!-- src/lib/components/Toast.svelte -->
<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toast } from '$lib/utils/toast';
  import CheckCircle from 'lucide-svelte/icons/check-circle';
  import XCircle from 'lucide-svelte/icons/x-circle';
  import Info from 'lucide-svelte/icons/info';

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
</script>

{#each $toast as { id, type, message } (id)}
  <div
    transition:fly={{ y: -30, duration: 300 }}
    class="fixed top-4 right-4 flex items-center p-4 mb-4 text-white rounded-lg shadow-lg {colors[type]}"
    role="alert"
  >
    <svelte:component this={icons[type]} class="w-5 h-5 mr-2" />
    <span class="font-medium">{message}</span>
  </div>
{/each}