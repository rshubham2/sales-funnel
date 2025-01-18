 <!-- src/lib/components/Footer.svelte -->
<script lang="ts">
  import { Mail, HelpCircle } from 'lucide-svelte';
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-300 shadow-inner fixed bottom-0 w-full z-30 h-10">
  <div class="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-full">
      <div class="flex items-center gap-4">
        <span class="text-gray-500 text-sm">© {currentYear} VC Tech</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="mailto:info@vctechnosolutions.com" class="text-gray-500 hover:text-gray-900">
          <Mail size={16} />
        </a>
        <a href="" class="text-gray-500 hover:text-gray-900">
          <HelpCircle size={16} />
        </a>
      </div>
    </div>
  </div>
</footer>