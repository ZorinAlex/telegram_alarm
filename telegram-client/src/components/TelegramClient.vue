<template>
  <div class="container">
    <div class="card">
      <h1 class="text-2xl font-bold mb-6 text-white">Login to Telegram</h1>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
          <input 
            type="text" 
            v-model="phoneNumber"
            :disabled="isLoading"
            class="input"
            placeholder="+1234567890"
          />
        </div>

        <div v-if="showVerificationCode">
          <label class="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
          <input 
            type="text"
            v-model="verificationCode"
            :disabled="isLoading"
            class="input"
            placeholder="Enter code"
          />
        </div>

        <div v-if="showPassword">
          <label class="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input 
            type="password"
            v-model="password"
            :disabled="isLoading"
            class="input"
            placeholder="Enter password"
          />
        </div>

        <button 
          @click="handleLogin"
          :disabled="isLoading"
          class="btn"
        >
          {{ isLoading ? 'Loading...' : 'Login' }}
        </button>
      </div>
    </div>
  </div>
</template> 