<!-- AppHeader.vue -->
<template>
  <header class="bg-white dark:bg-gray-800 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Telegram Monitor</h1>
          </div>
          <nav class="ml-6 flex space-x-4" v-if="isLoggedIn">
            <router-link 
              to="/messages" 
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium"
              :class="[
                $route.path === '/messages'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              Messages
            </router-link>
            <router-link 
              to="/settings" 
              class="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium"
              :class="[
                $route.path === '/settings'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              Settings
            </router-link>
          </nav>
        </div>
        <div class="flex items-center" v-if="isLoggedIn">
          <button
            @click="handleLogout"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { TelegramService } from '@/services/TelegramService';

export default defineComponent({
  name: 'AppHeader',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const telegramService = TelegramService.getInstance();

    const isLoggedIn = computed(() => telegramService.isLoggedIn());

    const handleLogout = async () => {
      try {
        await telegramService.logout();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return {
      isLoggedIn,
      handleLogout
    };
  }
});
</script> 