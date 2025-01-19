<!-- src/lib/components/Footer.svelte -->
<script>
    import '../styles/app.css'
     const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-300 shadow-sm mt-auto h-9">
  <div class="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
    <p class="text-center text-xs text-gray-500">
      © {currentYear} VC Tech. All rights reserved.
    </p>
  </div>
</footer>