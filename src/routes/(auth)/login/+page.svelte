<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Target, TrendingUp, Award, ChartBar } from 'lucide-svelte';
  

  export let form: ActionData;
  let mounted = false;

  const floatingIcons = [
    { icon: Target, color: 'text-blue-400/40', size: 24 },
    { icon: TrendingUp, color: 'text-indigo-400/40', size: 28 },
    { icon: Award, color: 'text-purple-400/40', size: 24 },
    { icon: ChartBar, color: 'text-cyan-400/40', size: 26 }
  ];

  onMount(() => {
    mounted = true;
    initParticles();
  });

  function initParticles() {
    particlesJS('particles-js', {
      particles: {
        number: { value: 50 },
        color: { value: '#4F46E5' },
        shape: { type: 'circle' },
        opacity: { value: 0.2, random: true },
        size: { value: 2, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#4F46E5',
          opacity: 0.1,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          out_mode: 'out'
        }
      }
    });
  }
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
</svelte:head>

<div class="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-indigo-50/50 flex items-center justify-center overflow-hidden">
  <div id="particles-js" class="absolute inset-0"></div>

  {#if mounted}
    {#each floatingIcons as {icon: Icon, color, size}, i}
      <div
        in:fly={{ y: 50, delay: i * 200, duration: 1000 }}
        class="absolute animate-float-{i + 1}"
        style="--float-offset: {i * 2}s"
      >
        <Icon size={size} class={color} />
      </div>
    {/each}
  {/if}

  <div 
    class="relative z-10 w-full max-w-md px-8"
    in:fade={{ duration: 1000 }}
  >
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900">Welcome Back!</h1>
      <p class="text-gray-600 mt-2">Power up your sales performance</p>
    </div>

    <form action="?/login" method="POST" use:enhance class="space-y-8">
      <div class="wave-group">
        <input 
          required 
          type="text" 
          name="username"
          class="input"
        >
        <span class="bar"></span>
        <label class="label">
          {#each "Username".split('') as char, i}
            <span class="label-char" style="--index: {i}">{char}</span>
          {/each}
        </label>
      </div>

      <div class="wave-group">
        <input 
          required 
          type="password" 
          name="password"
          class="input"
        >
        <span class="bar"></span>
        <label class="label">
          {#each "Password".split('') as char, i}
            <span class="label-char" style="--index: {i}">{char}</span>
          {/each}
        </label>
      </div>

      {#if form?.invalid}
        <p class="text-red-500 text-sm text-center" in:fade>Username and password are required.</p>
      {/if}

      {#if form?.credentials}
        <p class="text-red-500 text-sm text-center" in:fade>Invalid credentials. Please try again.</p>
      {/if}

      <button 
        type="submit"
        class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
               hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-300
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Login
      </button>
    </form>

    <div class="mt-6 text-center text-sm">
      <a href="/forgot-password" class="text-blue-600 hover:text-blue-700">Forgot password?</a>
    </div>
  </div>
</div>

<style lang="postcss">
  .wave-group {
    position: relative;
    width: 100%;
  }
  .wave-group .input {
    font-size: 16px;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(75, 85, 99, 0.2);
    background: transparent;
  }
  .wave-group .input:focus {
    outline: none;
  }
  .wave-group .label {
    color: #999;
    font-size: 18px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 10px;
    display: flex;
  }
  .wave-group .label-char {
    transition: 0.2s ease all;
    transition-delay: calc(var(--index) * .05s);
  }
  .wave-group .input:focus ~ label .label-char,
  .wave-group .input:valid ~ label .label-char {
    transform: translateY(-20px);
    font-size: 14px;
    color: #3B82F6;
  }
  .wave-group .bar {
    position: relative;
    display: block;
    width: 100%;
  }
  .wave-group .bar:before,
  .wave-group .bar:after {
    content: '';
    height: 2px;
    width: 0;
    bottom: 1px;
    position: absolute;
    background: #3B82F6;
    transition: 0.2s ease all;
  }
  .wave-group .bar:before {
    left: 50%;
  }
  .wave-group .bar:after {
    right: 50%;
  }
  .wave-group .input:focus ~ .bar:before,
  .wave-group .input:focus ~ .bar:after {
    width: 50%;
  }

  @keyframes float-1 {
    0%, 100% { transform: translate(-15vw, -15vh) rotate(0deg); }
    50% { transform: translate(-13vw, -13vh) rotate(10deg); }
  }

  @keyframes float-2 {
    0%, 100% { transform: translate(15vw, -15vh) rotate(0deg); }
    50% { transform: translate(13vw, -13vh) rotate(-10deg); }
  }

  @keyframes float-3 {
    0%, 100% { transform: translate(-15vw, 15vh) rotate(0deg); }
    50% { transform: translate(-13vw, 13vh) rotate(15deg); }
  }

  @keyframes float-4 {
    0%, 100% { transform: translate(15vw, 15vh) rotate(0deg); }
    50% { transform: translate(13vw, 13vh) rotate(-15deg); }
  }

  .animate-float-1 { animation: float-1 6s ease-in-out infinite; animation-delay: var(--float-offset); }
  .animate-float-2 { animation: float-2 7s ease-in-out infinite; animation-delay: var(--float-offset); }
  .animate-float-3 { animation: float-3 8s ease-in-out infinite; animation-delay: var(--float-offset); }
  .animate-float-4 { animation: float-4 9s ease-in-out infinite; animation-delay: var(--float-offset); }

  :global(#particles-js) {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
</style>