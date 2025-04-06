<template>
  <header class="bg-slate-800 text-white relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-xl font-semibold inline-flex items-center gap-2">
            <i class="mdi mdi-message-text text-2xl"></i>
            Telegram Monitor
          </router-link>
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex" v-if="isLoggedIn">
            <router-link
              to="/messages" 
              class="px-4 h-14 inline-flex items-center text-sm font-medium transition-colors gap-2"
              :class="[$route.path === '/messages' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            >
              <i class="mdi mdi-message-text-outline"></i>
              {{ $t('header.messages') }}
            </router-link>
            <router-link 
              to="/settings" 
              class="px-4 h-14 inline-flex items-center text-sm font-medium transition-colors gap-2"
              :class="[$route.path === '/settings' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            >
              <i class="mdi mdi-cog"></i>
              {{ $t('header.settings') }}
            </router-link>
          </nav>
        </div>
        
        <!-- Desktop Logout Button -->
        <button 
          v-if="isLoggedIn"
          @click="handleLogout" 
          class="hidden md:inline-flex px-4 h-14 text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors items-center gap-2"
        >
          <i class="mdi mdi-logout"></i>
          {{ $t('header.logout') }}
        </button>

        <!-- Mobile Menu Button -->
        <button 
          v-if="isLoggedIn"
          @click="isMobileMenuOpen = !isMobileMenuOpen" 
          class="md:hidden p-2 rounded-md text-gray-300 hover:bg-slate-700 focus:outline-none"
        >
          <i class="mdi mdi-menu text-2xl"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-if="isLoggedIn && isMobileMenuOpen" 
        class="absolute top-14 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 shadow-lg md:hidden"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            to="/messages"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="[$route.path === '/messages' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            @click="isMobileMenuOpen = false"
          >
            <i class="mdi mdi-message-text-outline mr-2"></i>
            {{ $t('header.messages') }}
          </router-link>
          <router-link
            to="/settings"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="[$route.path === '/settings' ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-700']"
            @click="isMobileMenuOpen = false"
          >
            <i class="mdi mdi-cog mr-2"></i>
            {{ $t('header.settings') }}
          </router-link>
          <button
            @click="handleLogoutMobile"
            class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-slate-700 transition-colors"
          >
            <i class="mdi mdi-logout mr-2"></i>
            {{ $t('header.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
  <main class="py-6">
    <router-view />
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { TelegramService } from '@/services/TelegramService';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
    const telegramService = TelegramService.getInstance();
    const isMobileMenuOpen = ref(false);
    const { t } = useI18n();
    const isLoggedIn = ref(false);

    const updateLoginState = () => {
      console.log('Updating login state...');
      isLoggedIn.value = telegramService.isLoggedIn();
      console.log('New login state:', isLoggedIn.value);
    };

    onMounted(() => {
      updateLoginState();
      window.addEventListener('telegramSessionChanged', updateLoginState);
    });

    onUnmounted(() => {
      window.removeEventListener('telegramSessionChanged', updateLoginState);
    });

    const handleLogout = async () => {
      try {
        await telegramService.logout();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const handleLogoutMobile = async () => {
      isMobileMenuOpen.value = false;
      await handleLogout();
    };

    return {
      isLoggedIn,
      handleLogout,
      handleLogoutMobile,
      isMobileMenuOpen
    };
  }
});
</script>
