<script lang="ts">
  import type { ActionData } from "./$types";
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { UserPlus, Shield, Lock, Star } from 'lucide-svelte';

  export let form: ActionData;
  let mounted = false;

  const floatingIcons = [
    { icon: Shield, color: 'text-emerald-400/40', size: 24 },
    { icon: Star, color: 'text-yellow-400/40', size: 28 },
    { icon: Lock, color: 'text-rose-400/40', size: 24 },
    { icon: UserPlus, color: 'text-blue-400/40', size: 26 }
  ];

  onMount(() => {
    mounted = true;
    initParticles();
  });

  function initParticles() {
    particlesJS('particles-js', {
      particles: {
        number: { value: 50 },
        color: { value: '#10B981' },
        shape: { type: 'circle' },
        opacity: { value: 0.2, random: true },
        size: { value: 2, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#10B981',
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

<div class="fixed inset-0 bg-gradient-to-br from-emerald-50/50 via-white/50 to-blue-50/50 flex items-center justify-center overflow-hidden">
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
      <h1 class="text-4xl font-bold text-gray-900">Join Our Team</h1>
      <p class="text-gray-600 mt-2">Create your account to get started</p>
    </div>

    <form action="?/register" method="POST" use:enhance class="space-y-8">
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

      {#if form?.user}
        <p class="text-red-500 text-sm text-center" in:fade>
          Username already exists. Please choose another.
        </p>
      {/if}

      <button 
        type="submit"
        class="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl
               hover:from-emerald-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300
               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Create Account
      </button>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-gray-600">Already have an account?</span>
      <a href="/login" class="text-emerald-600 hover:text-emerald-700 ml-1">Login here</a>
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
    color: #10B981;
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
    background: #10B981;
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