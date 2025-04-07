import './polyfills'
import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import './types' // Import global types

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

// Make router available globally for debugging
window.router = router;

console.log('Starting application initialization...');

try {
  console.log('Creating Vue app...');
  const app = createApp(App);

  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  
  app.mount('#app');
  console.log('App mounted successfully');
  
  // Force initial navigation based on login status
  const isLoggedIn = localStorage.getItem('telegramSession') !== null;
  if (isLoggedIn) {
    console.log('User is logged in, navigating to /messages');
    router.push('/messages');
  } else {
    console.log('User is not logged in, navigating to /login');
    router.push('/login');
  }
} catch (error: any) {
  console.error('Error during app initialization:', error);
}
