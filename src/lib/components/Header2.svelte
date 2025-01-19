<!-- src/lib/components/Header.svelte -->
<script lang="ts">
  import '../styles/app.css'
  import { Bell, LogOut, User as UserIcon, ArrowLeft } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { enhance, applyAction } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { goto } from '$app/navigation';

  interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'pending_user' | 'other';
  }

  let showNotifications = false;
  let showUserMenu = false;
  let notifications: Notification[] = [];
  let notificationCount = 0;
  let isAdmin = false;

  $: user = $page.data.user;
  $: isAdmin = user.role === 'ADMIN' || false;
  onMount(async () => {
    notifications = await fetchNotifications();
    notificationCount = notifications.length;
  });

  function toggleNotifications() {
    showNotifications = !showNotifications;
    if (showUserMenu) showUserMenu = false;
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
    if (showNotifications) showNotifications = false;
  }

  function viewProfile() {
    showUserMenu = false;
    goto('/profile');
  }

async function fetchNotifications(): Promise<Notification[]> {
  // Fetch pending users from the server
  const response = await fetch('/api/pending-users');
  const pendingUsers = await response.json();

  const pendingUserNotifications = pendingUsers.map((user: any, index: any) => ({
    id: -index - 1, // Use negative IDs to avoid conflicts with other notifications
    title: 'Pending User Approval',
    message: `New user ${user.username} is waiting for approval`,
    time: formatDate(user.createdAt),
    type: 'pending_user' as const
  }));



  return [...pendingUserNotifications];
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleString();
}

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-menu') && !target.closest('.user-menu')) {
      closeAllMenus();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeAllMenus();
    }
  }

  function closeAllMenus() {
    showNotifications = false;
    showUserMenu = false;
  }

onMount(() => {
  const intervalId = setInterval(refreshNotifications, 5000); // Refresh every 5sec

  return () => {
    clearInterval(intervalId);
  };
});

function handleNotificationClick(notification: Notification) {
  if (notification.type === 'pending_user') {
    goto('/admin');
    showNotifications = false;
  }
}

async function refreshNotifications() {
  notifications = await fetchNotifications();
  notificationCount = notifications.filter(n => n.type === 'pending_user').length;
}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<header class="bg-gray-300 shadow-sm z-10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-14">
      <div class="flex items-center">
      </div>
      <div class="flex items-center">
        <div class="relative notification-menu">
          <button on:click={toggleNotifications} type="button" class="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300">
            <span class="sr-only">View notifications</span>
            <Bell class="h-5 w-5" />
            {#if notificationCount > 0}
              <span class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notificationCount}</span>
            {/if}
          </button>
          {#if showNotifications}
            <div class="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div class="p-4 bg-gray-100 border-b">
                <h3 class="text-lg font-semibold">Notifications</h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                {#each notifications as notification (notification.id)}
                  <div class="p-4 border-b hover:bg-gray-50 transition duration-150 ease-in-out">
                    <h4 class="text-sm font-semibold text-gray-900">
                      {#if notification.type === 'pending_user'}
                        <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {/if}
                      {notification.title}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p class="text-xs text-gray-400 mt-2">{notification.time}</p>
                    {#if notification.type === 'pending_user'}
                      <a href="/admin" class="text-sm text-blue-500 hover:text-blue-700 mt-2 inline-block">
                        Go to User Management
                      </a>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        <div class="ml-3 relative user-menu">
          <button on:click={toggleUserMenu} type="button" class="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300">
            <span class="sr-only">Open user menu</span>
            <img class="h-8 w-8 rounded-full" src={user?.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"} alt="User profile">
          </button>
          {#if showUserMenu}
            <div class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div class="p-6 bg-gray-100 border-b flex items-center">
                <img class="h-24 w-24 rounded-full object-cover mr-4" src={user?.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"} alt="User profile">
                <h3 class="text-2xl font-semibold">Hello, <span class="font-normal">{user?.name || user?.username || 'User'}</span></h3>
              </div>
              <div class="py-2">
                <button on:click={viewProfile} class="block w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-100">
                  <UserIcon class="inline-block h-5 w-5 mr-3" />
                  View Profile
                </button>
                {#if user}
                  <form action="/logout" method="POST" use:enhance={() => {
                    return async ({result}) => {
                      invalidateAll()
                      await applyAction(result)
                    }
                  }}>
                    <button type="submit" class="block w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut class="inline-block h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </form>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</header>

<slot />