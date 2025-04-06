<!-- LoginView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-center">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ $t('login.title') }}</h2>
          
          <div class="space-y-6">
            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('login.phoneNumber') }}
              </label>
              <input 
                id="phoneNumber"
                v-model="phoneNumber" 
                type="text" 
                :placeholder="$t('login.phoneNumberPlaceholder')"
                :disabled="isLoading || showCodeInput"
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
            </div>

            <div v-if="showCodeInput">
              <label for="verificationCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('login.verificationCode') }}
              </label>
              <input 
                id="verificationCode"
                v-model="verificationCode" 
                type="text" 
                :placeholder="$t('login.verificationCodePlaceholder')"
                :disabled="isLoading"
                @keyup.enter="handleVerificationCode"
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
            </div>

            <div v-if="showPasswordInput">
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('login.password') }}
              </label>
              <input 
                id="password"
                v-model="password" 
                type="password" 
                :placeholder="$t('login.passwordPlaceholder')"
                :disabled="isLoading"
                @keyup.enter="handleVerificationCode"
                class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
            </div>

            <button 
              @click="handleButtonClick" 
              :disabled="isLoading || (!showCodeInput && !phoneNumber) || (showCodeInput && !verificationCode) || (showPasswordInput && !password)"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? $t('login.loading') : buttonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { TelegramService } from '@/services/TelegramService';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const telegramService = TelegramService.getInstance();
    const { t } = useI18n();
    const isLoading = ref(false);
    const showCodeInput = ref(false);
    const showPasswordInput = ref(false);
    const phoneNumber = ref('');
    const verificationCode = ref('');
    const password = ref('');
    let codeResolver: ((code: string) => void) | null = null;

    const buttonText = computed(() => {
      if (showCodeInput.value) return t('login.submitCodeButton');
      return t('login.loginButton');
    });

    const handleVerificationCode = async () => {
      if (!verificationCode.value || !password.value || !codeResolver) return;
      
      isLoading.value = true;
      try {
        console.log('Submitting verification code and password...');
        await telegramService.setPassword(password.value);
        const result = await codeResolver(verificationCode.value);
        codeResolver = null;
        
        console.log('Login successful, waiting for session to be saved...');
        // Wait a moment for the session to be properly saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (telegramService.isLoggedIn()) {
          console.log('Session confirmed, redirecting to messages...');
          router.push('/messages');
        } else {
          console.error('Login seemed successful but session was not saved');
        }
      } catch (error) {
        console.error('Error during login:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const handleLogin = async () => {
      if (!phoneNumber.value) return;
      
      console.log('Starting login process with phone number:', phoneNumber.value);
      isLoading.value = true;
      try {
        console.log('Initializing client...');
        await telegramService.initializeClient();
        
        console.log('Client initialized, attempting login...');
        const result = await telegramService.login(phoneNumber.value);
        
        // If login is successful without 2FA (using saved session)
        if (telegramService.isLoggedIn() && !showCodeInput.value) {
          console.log('Login successful with saved session, redirecting...');
          router.push('/messages');
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const handleButtonClick = () => {
      console.log('Button clicked!');
      if (showCodeInput.value && verificationCode.value && password.value) {
        handleVerificationCode();
      } else if (!showCodeInput.value) {
        handleLogin();
      }
    };

    // Listen for code request events
    window.addEventListener('requestCode', ((event: CustomEvent) => {
      showCodeInput.value = true;
      showPasswordInput.value = true;
      isLoading.value = false;
      codeResolver = event.detail.resolve;
    }) as EventListener);

    onMounted(async () => {
      if (telegramService.isLoggedIn()) {
        isLoading.value = true;
        try {
          await telegramService.initializeClient();
          await telegramService.login('');
          router.push('/messages');
        } catch (error) {
          console.error('Error auto-logging in with saved session:', error);
          localStorage.removeItem('telegramSession');
        } finally {
          isLoading.value = false;
        }
      }
    });

    return {
      isLoading,
      showCodeInput,
      showPasswordInput,
      phoneNumber,
      verificationCode,
      password,
      buttonText,
      handleVerificationCode,
      handleButtonClick
    };
  }
});
</script>

<style scoped>
.login-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-container {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: #f8fafc;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.primary-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.primary-button:hover {
  background-color: #2563eb;
}

.primary-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .form-container {
    background: #2d2d2d;
  }

  input {
    background: #3d3d3d;
    border-color: #4d4d4d;
    color: #e5e5e5;
  }

  label {
    color: #e5e5e5;
  }
}
</style> 