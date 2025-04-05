<template>
  <header class="bg-slate-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-xl font-semibold">Telegram Monitor</router-link>
          <nav class="flex" v-if="isLoggedIn">
            <router-link 
              to="/messages" 
              class="px-4 h-14 inline-flex items-center text-sm font-medium transition-colors"
              :class="[$route.path === '/messages' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            >
              Messages
            </router-link>
            <router-link 
              to="/settings" 
              class="px-4 h-14 inline-flex items-center text-sm font-medium transition-colors"
              :class="[$route.path === '/settings' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            >
              Settings
            </router-link>
          </nav>
        </div>
        <button 
          v-if="isLoggedIn"
          @click="handleLogout" 
          class="px-4 h-14 text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
  <main class="py-6">
    <router-view />
  </main>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { TelegramService } from '@/services/TelegramService';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
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
