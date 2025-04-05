<!-- SettingsView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold mb-6 text-gray-200">Settings</h1>
    
    <div class="bg-gray-800 shadow rounded-lg p-6 space-y-8">
      <!-- Message Limit Section -->
      <div>
        <h2 class="text-lg font-medium text-gray-200 mb-4">Message Display</h2>
        <div>
          <label for="messageLimit" class="block text-sm font-medium text-gray-200">
            Number of messages to display
          </label>
          <div class="mt-1">
            <input
              type="number"
              id="messageLimit"
              v-model="messageLimit"
              min="1"
              max="1000"
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 bg-gray-700 text-gray-200 rounded-md"
            />
          </div>
          <p class="mt-2 text-sm text-gray-400">
            This setting determines how many recent messages will be shown and stored locally.
          </p>
        </div>
      </div>

      <!-- Keywords Section -->
      <div>
        <h2 class="text-lg font-medium text-gray-200 mb-4">Message Filtering</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <input 
              v-model="newKeyword" 
              type="text" 
              placeholder="Add new keyword"
              @keyup.enter="addNewKeyword"
              class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            >
            <button 
              @click="addNewKeyword" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(keyword, index) in keywords" 
              :key="index" 
              class="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-900/40 text-blue-300"
            >
              {{ keyword }}
              <button 
                @click="removeKeyword(index)" 
                class="ml-2 text-blue-400 hover:text-blue-200 focus:outline-none"
                title="Remove keyword"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>

          <p class="text-sm text-gray-400">
            Messages containing these keywords will be highlighted. Add keywords to filter important messages.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'SettingsView',
  setup() {
    const settingsStore = useSettingsStore();
    const { messageLimit, keywords } = storeToRefs(settingsStore);
    const newKeyword = ref('');

    const addNewKeyword = () => {
      if (newKeyword.value.trim()) {
        settingsStore.addKeyword(newKeyword.value.trim());
        newKeyword.value = '';
      }
    };

    const removeKeyword = (index: number) => {
      settingsStore.removeKeyword(index);
    };

    return {
      messageLimit,
      keywords,
      newKeyword,
      addNewKeyword,
      removeKeyword
    };
  },
});
</script>

<style scoped>
.settings-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.back-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
}

.back-button:hover {
  background-color: #2563eb;
}

.keywords-section {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.description {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.keyword-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.keyword-input input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.keyword-input input:focus {
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
}

.primary-button:hover {
  background-color: #2563eb;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.remove-keyword {
  background: none;
  border: none;
  color: #0369a1;
  font-size: 1.25rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.remove-keyword:hover {
  background-color: #bae6fd;
}

@media (prefers-color-scheme: dark) {
  .keywords-section {
    background: #2d2d2d;
  }

  .description {
    color: #94a3b8;
  }

  .keyword-input input {
    background: #3d3d3d;
    border-color: #4d4d4d;
    color: #e5e5e5;
  }

  .keyword-tag {
    background-color: #1e3a8a;
    color: #93c5fd;
  }

  .remove-keyword {
    color: #93c5fd;
  }

  .remove-keyword:hover {
    background-color: #1e40af;
  }
}
</style> 