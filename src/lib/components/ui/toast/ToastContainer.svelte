<!-- // src/lib/components/ui/toast/ToastContainer.svelte -->
<script lang="ts">
  import { toast } from './toast';
  import Toast from './Toast.svelte';

  function handleClose(id: string) {
    toast.remove(id);
  }
</script>

{#each $toast as { id, message, type, duration, position } (id)}
  <Toast
    {message}
    {type}
    {duration}
    {position}
    on:close={() => handleClose(id)}
  />
{/each}