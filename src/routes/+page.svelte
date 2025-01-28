<!-- src/routes/+page.svelte -->
<script lang="ts">
import { onNavigate, goto } from '$app/navigation';
  import { 
    Target, 
    Users, 
    Presentation,
    Shield,
    HandshakeIcon,
    CheckCircle2,
    ArrowDown,
    LineChart,
    BarChart3,
    TrendingUp,
    Circle, Square, Triangle
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';

  let mounted = false;
  let y: number;

  onMount(() => {
    mounted = true;
  });

  const stages = [
    { 
      icon: Target, 
      title: 'Lead Generation', 
      description: 'Identify and categorize high-value prospects across business verticals. Our platform helps you track potential clients and their initial interactions.',
      color: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    { 
      icon: Users, 
      title: 'Qualification', 
      description: 'Evaluate prospects through our structured assessment process. Determine fit and potential with our comprehensive qualification framework.',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-500'
    },
    { 
      icon: Presentation, 
      title: 'Presentation', 
      description: 'Showcase our security solutions with confidence. Track presentation schedules and outcomes efficiently.',
      color: 'bg-sky-50',
      iconColor: 'text-sky-500'
    },
    { 
      icon: Shield, 
      title: 'Proof of Concept', 
      description: 'Manage trial periods and demonstrate value through hands-on implementation. Monitor POC metrics and feedback in real-time.',
      color: 'bg-cyan-50',
      iconColor: 'text-cyan-500'
    },
    { 
      icon: HandshakeIcon, 
      title: 'Negotiation', 
      description: 'Navigate deal terms with integrated proposal and negotiation tracking. Keep all stakeholders aligned on progress.',
      color: 'bg-teal-50',
      iconColor: 'text-teal-500'
    },
    { 
      icon: CheckCircle2, 
      title: 'Closure', 
      description: 'Secure partnerships with streamlined closing processes. Track win rates and analyze successful deal patterns.',
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500'
    }
  ];
const shapes = [
    { component: Circle, class: 'top-20 left-20', size: 40, opacity: 0.1, delay: 0 },
    { component: Square, class: 'top-40 right-32', size: 60, opacity: 0.15, delay: 200 },
    { component: Triangle, class: 'bottom-20 left-1/4', size: 50, opacity: 0.1, delay: 400 },
    { component: Circle, class: 'bottom-40 right-1/4', size: 70, opacity: 0.08, delay: 600 },
  ];

  function navigateTo(path: string) {
    goto(path);
  }
</script>

<svelte:window bind:scrollY={y}/>

<div class="min-h-screen bg-white">
  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center overflow-hidden">
   <!-- Gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <!-- Animated background shapes -->
    {#if mounted}
      {#each shapes as shape}
        <div
          class="absolute {shape.class} animate-float"
          in:fade="{{ delay: shape.delay, duration: 1500 }}"
        >
          <svelte:component
            this={shape.component}
            size={shape.size}
            class="text-blue-900 opacity-{shape.opacity}"
          />
        </div>
      {/each}
    {/if}
        <!-- Hero content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {#if mounted}
        <div in:fade="{{ duration: 1000 }}" class="text-center">
          <div class="inline-block mb-4 px-6 py-2 bg-blue-100 rounded-full">
            <span class="text-blue-600 font-semibold">Streamline Your Sales Pipeline</span>
          </div>
          <h1 class="text-6xl md:text-7xl font-bold text-blue-950 mb-8">
            Transform Your 
            <span class="relative">
              <span class="relative z-10 text-blue-600">Sales Journey</span>
              <span class="absolute bottom-0 left-0 w-full h-3 bg-blue-200 opacity-50 -rotate-1"></span>
            </span>
          </h1>
          <p class="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your sales pipeline and boost team performance with our intelligent management system
          </p>
          <div class="flex gap-4 justify-center">
            <button 
              class="group relative px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              on:click={() => navigateTo('/login')}            
              >
              Get Started
              <div class="absolute inset-0 bg-white rounded-xl opacity-25 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </button>
            <button 
              class="group relative px-8 py-4 bg-white text-blue-600 border-2 border-blue-200 rounded-xl hover:border-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              on:click={() => window.open('https://vctechnosolutions.com/')}
              >
              Learn More
            </button>
          </div>
          <div class="mt-16 animate-bounce">
            <ArrowDown size={32} class="mx-auto text-blue-600" />
          </div>
        </div>
      {/if}
    </div>
    </div>
    
  </section>

  <!-- Stats Section -->
  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Performance Metrics</h2>
        <p class="text-xl text-gray-600">Driving success through measurable results</p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-12">
        {#if mounted}
          <div 
            in:scale="{{ delay: 200, duration: 1000 }}" 
            class="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white shadow-lg"
          >
            <BarChart3 size={48} class="mx-auto mb-4 text-blue-600" />
            <div class="text-5xl font-bold text-blue-950 mb-4">35%</div>
            <div class="text-lg text-gray-600">Success Rate</div>
          </div>
          
          <div 
            in:scale="{{ delay: 400, duration: 1000 }}" 
            class="text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-lg"
          >
            <TrendingUp size={48} class="mx-auto mb-4 text-indigo-600" />
            <div class="text-5xl font-bold text-blue-950 mb-4">₹25L+</div>
            <div class="text-lg text-gray-600">Avg Deal Size</div>
          </div>
          
          <div 
            in:scale="{{ delay: 600, duration: 1000 }}" 
            class="text-center p-8 rounded-2xl bg-gradient-to-br from-sky-50 to-white shadow-lg"
          >
            <LineChart size={48} class="mx-auto mb-4 text-sky-600" />
            <div class="text-5xl font-bold text-blue-950 mb-4">20+</div>
            <div class="text-lg text-gray-600">Monthly Leads</div>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Sales Process Section -->
  <section class="py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Your Sales Journey</h2>
        <p class="text-xl text-gray-600">A streamlined process for maximum efficiency</p>
      </div>

      <div class="space-y-8">
        {#each stages as stage, i}
          {#if mounted}
            <div 
              in:fly="{{ y: 50, delay: i * 100, duration: 1000 }}"
              class="group"
            >
              <div class="relative {stage.color} rounded-2xl p-8 shadow-lg transition-all duration-500 hover:scale-[1.02]">
                <div class="flex items-start gap-6">
                  <div class="flex-shrink-0">
                    <div class="p-4 rounded-xl bg-white/80 backdrop-blur">
                      <svelte:component this={stage.icon} size={48} class="{stage.iconColor}" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">{stage.title}</h3>
                    <p class="text-lg text-gray-600">{stage.description}</p>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-24 bg-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-4xl font-bold text-gray-900 mb-8">Ready to Elevate Your Sales Performance?</h2>
        <button 
        on:click={() => navigateTo('/login')}
        class="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300">
          Start Your Journey
        </button>
      </div>
    </div>
  </section>
</div>

<style lang="postcss">
  :global(html) {
    scroll-behavior: smooth;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
</style>