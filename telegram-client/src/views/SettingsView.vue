<!-- SettingsView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold mb-6 text-gray-200">Settings</h1>
    
    <div class="bg-gray-800 shadow rounded-lg p-6 space-y-8">
      <!-- Message Limit Section -->
      <div>
        <h2 class="text-lg font-medium text-gray-200 mb-4">Message Display</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <input 
              type="number"
              v-model="messageLimit"
              min="1"
              max="1000"
              class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              placeholder="Number of messages to display"
            />
          </div>
          <p class="text-sm text-gray-400">
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

      <!-- Channels Section -->
      <div>
        <h2 class="text-lg font-medium text-gray-200 mb-4">Channel Filtering</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <input 
              v-model="newChannel" 
              type="text" 
              placeholder="Add channel name or ID"
              @keyup.enter="addNewChannel"
              class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            >
            <button 
              @click="addNewChannel" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(channel, index) in channels" 
              :key="index" 
              class="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-900/40 text-blue-300"
            >
              {{ channel }}
              <button 
                @click="removeChannel(index)" 
                class="ml-2 text-blue-400 hover:text-blue-200 focus:outline-none"
                title="Remove channel"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>

          <p class="text-sm text-gray-400">
            Only messages from these channels will be shown. If no channels are added, messages from all channels will be displayed.
          </p>
        </div>
      </div>

      <!-- Sound Mappings Section -->
      <div class="space-y-6">
        <div class="bg-gray-800 shadow rounded-lg">
          <h3 class="text-lg font-medium text-gray-200 mb-4">Sound Notifications</h3>
          
          <!-- Default Sound Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Default Sound</label>
            <div class="flex gap-4">
              <select 
                v-model="defaultSound"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option v-for="sound in availableSounds" :key="sound" :value="sound">
                  {{ sound }}
                </option>
              </select>
              <button 
                @click="testSound(defaultSound)"
                class="px-3 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                title="Test Default Sound"
              >
                🔊 Test
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-400">
              This sound will play for messages that match keywords without a specific sound mapping.
            </p>
          </div>

          <!-- Add New Sound Mapping -->
          <div class="mb-6 space-y-4">
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-300 mb-2">Select Keyword</label>
                <div class="flex gap-4">
                  <select 
                    v-model="selectedKeyword"
                    class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a keyword</option>
                    <option 
                      v-for="keyword in availableKeywords" 
                      :key="keyword" 
                      :value="keyword"
                    >
                      {{ keyword }}
                    </option>
                  </select>
                  <select 
                    v-model="newMappingSound"
                    class="w-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option v-for="sound in availableSounds" :key="sound" :value="sound">
                      {{ sound }}
                    </option>
                  </select>
                  <button 
                    @click="addNewSoundMapping"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    :disabled="!selectedKeyword"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Existing Sound Mappings -->
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(mapping, index) in soundMappings" 
              :key="index"
              class="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-900/40 text-blue-300"
            >
              {{ mapping.keywords[0] }} → {{ mapping.soundFile }}
              <button 
                @click="testSound(mapping.soundFile)"
                class="ml-2 text-blue-400 hover:text-blue-200 focus:outline-none"
                title="Test Sound"
              >
                🔊
              </button>
              <button 
                @click="toggleMapping(index)"
                :class="[
                  'ml-1 focus:outline-none',
                  mapping.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
                ]"
                :title="mapping.enabled ? 'Disable' : 'Enable'"
              >
                {{ mapping.enabled ? '✓' : '✗' }}
              </button>
              <button 
                @click="removeSoundMapping(index)"
                class="ml-1 text-blue-400 hover:text-blue-200 focus:outline-none"
                title="Remove mapping"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import type { SoundMapping } from '@/stores/settingsStore';

export default defineComponent({
  name: 'SettingsView',
  setup() {
    const settingsStore = useSettingsStore();
    const { messageLimit, keywords, channels, soundMappings, availableSounds, defaultSound } = storeToRefs(settingsStore);
    const newKeyword = ref('');
    const newChannel = ref('');
    const selectedKeyword = ref('');
    const newMappingSound = ref(availableSounds.value[0] || '');

    // Computed property to get available keywords (excluding ones already mapped)
    const availableKeywords = computed(() => {
      const mappedKeywords = new Set(soundMappings.value.map(m => m.keywords[0]));
      return keywords.value.filter(k => !mappedKeywords.has(k));
    });

    const addNewKeyword = () => {
      if (newKeyword.value.trim()) {
        settingsStore.addKeyword(newKeyword.value.trim());
        newKeyword.value = '';
      }
    };

    const removeKeyword = (index: number) => {
      settingsStore.removeKeyword(index);
    };

    const addNewChannel = () => {
      if (newChannel.value.trim()) {
        settingsStore.addChannel(newChannel.value.trim());
        newChannel.value = '';
      }
    };

    const removeChannel = (index: number) => {
      settingsStore.removeChannel(index);
    };

    const addNewSoundMapping = () => {
      if (selectedKeyword.value && newMappingSound.value) {
        settingsStore.addSoundMapping({
          keywords: [selectedKeyword.value],
          soundFile: newMappingSound.value,
          enabled: true
        });
        selectedKeyword.value = ''; // Reset selection after adding
      }
    };

    const removeSoundMapping = (index: number) => {
      settingsStore.removeSoundMapping(index);
    };

    const toggleMapping = (index: number) => {
      const mapping = { ...soundMappings.value[index] };
      mapping.enabled = !mapping.enabled;
      settingsStore.updateSoundMapping(index, mapping);
    };

    const testSound = async (soundFile: string) => {
      const audio = new Audio(`/${soundFile}`);
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.error('Error playing test sound:', error);
      }
    };

    return {
      settingsStore,
      messageLimit,
      keywords,
      channels,
      soundMappings,
      availableSounds,
      defaultSound,
      newKeyword,
      newChannel,
      selectedKeyword,
      newMappingSound,
      availableKeywords,
      addNewKeyword,
      removeKeyword,
      addNewChannel,
      removeChannel,
      addNewSoundMapping,
      removeSoundMapping,
      toggleMapping,
      testSound
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