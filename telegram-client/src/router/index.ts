import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MessagesView from '@/views/MessagesView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { TelegramService } from '@/services/TelegramService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/messages'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const telegramService = TelegramService.getInstance()
  const isLoggedIn = telegramService.isLoggedIn()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  } else if (to.path === '/login' && isLoggedIn) {
    next('/messages')
  } else {
    next()
  }
})

export default router
