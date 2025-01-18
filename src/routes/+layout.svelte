<script lang="ts">
  import { page } from '$app/stores'
  import {enhance} from '$app/forms'

</script>

<svelte:head>
  <title>SvelteKit Auth</title>
</svelte:head>

<nav>
  {#if !$page.data.user}
    <a href="/login">Login</a>
    <a href="/register">Register</a>
  {/if}

  {#if $page.data.user}
    <a href="/admin">Admin</a>

    <form class="logout" 	action="/logout" method="POST" use:enhance>
      <button type="submit">Logout</button>
    </form>
  {/if}
</nav>

<main>
  <slot />
</main>
