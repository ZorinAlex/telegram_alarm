<!-- SettingsView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-200 px-2 sm:px-0">{{ $t('settings.title') }}</h1>
    
    <div class="bg-gray-800 shadow rounded-none sm:rounded-lg p-3 sm:p-6 space-y-6 sm:space-y-8">
      <!-- Language Selection Section -->
      <div>
        <h2 class="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">{{ $t('settings.language.title') }}</h2>
        <div class="space-y-3 sm:space-y-4">
          <div class="flex gap-2 sm:gap-4">
            <button
              @click="settingsStore.setLanguage('en')"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ $t('settings.language.english') }}
            </button>
            <button
              @click="settingsStore.setLanguage('ua')"
              class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                language === 'ua'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ $t('settings.language.ukrainian') }}
            </button>
          </div>
          <p class="text-xs sm:text-sm text-gray-400">
            {{ $t('settings.language.hint') }}
          </p>
        </div>
      </div>

      <!-- Message Limit Section -->
      <div>
        <h2 class="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">{{ $t('settings.messageDisplay.title') }}</h2>
        <div class="space-y-3 sm:space-y-4">
          <div class="flex gap-2 sm:gap-4">
            <input 
              type="number"
              v-model="messageLimit"
              min="1"
              max="1000"
              class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
              :placeholder="$t('settings.messageDisplay.placeholder')"
            />
          </div>
          <p class="text-xs sm:text-sm text-gray-400">
            {{ $t('settings.messageDisplay.hint') }}
          </p>
        </div>
      </div>

      <!-- Keywords Section -->
      <div>
        <h2 class="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">{{ $t('settings.keywords.title') }}</h2>
        <div class="space-y-3 sm:space-y-4">
          <div class="flex gap-2 sm:gap-4">
            <input 
              v-model="newKeyword" 
              type="text" 
              :placeholder="$t('settings.keywords.placeholder')"
              @keyup.enter="addNewKeyword"
              class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-200"
            >
            <button 
              @click="addNewKeyword" 
              class="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {{ $t('settings.keywords.add') }}
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(keyword, index) in keywords" 
              :key="index" 
              class="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm bg-blue-900/40 text-blue-300"
            >
              {{ keyword }}
              <button 
                @click="removeKeyword(index)" 
                class="ml-1 sm:ml-2 text-blue-400 hover:text-blue-200 focus:outline-none"
                :title="$t('settings.keywords.remove')"
              >
                <i class="mdi mdi-close text-base sm:text-lg"></i>
              </button>
            </span>
          </div>

          <p class="text-xs sm:text-sm text-gray-400">
            {{ $t('settings.keywords.hint') }}
          </p>
        </div>
      </div>

      <!-- Channels Section -->
      <div>
        <h3 class="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">{{ $t('settings.channels.title') }}</h3>
        <div class="space-y-3 sm:space-y-4">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div class="flex-1 flex flex-col sm:flex-row gap-2">
              <input 
                v-model="newChannelName"
                type="text"
                class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                :placeholder="$t('settings.channels.namePlaceholder')"
              />
              <input 
                v-model="newChannelId"
                type="text"
                class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                :placeholder="$t('settings.channels.idPlaceholder')"
              />
            </div>
            <button 
              @click="addNewChannel"
              class="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {{ $t('settings.channels.add') }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(channel, index) in channels" 
              :key="index"
              class="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm bg-red-900/40 text-red-300 break-all"
            >
              {{ channel.name }} (ID: {{ channel.id }})
              <button 
                @click="removeChannel(index)"
                class="ml-1 sm:ml-2 text-red-400 hover:text-red-200 focus:outline-none"
                :title="$t('settings.channels.remove')"
              >
                <i class="mdi mdi-close text-base sm:text-lg"></i>
              </button>
            </span>
          </div>
          <p class="text-xs sm:text-sm text-gray-400">
            {{ $t('settings.channels.hint') }}
          </p>
        </div>
      </div>

      <!-- Sound Mappings Section -->
      <div class="space-y-4 sm:space-y-6">
        <div class="bg-gray-800 shadow rounded-none sm:rounded-lg">
          <h3 class="text-base sm:text-lg font-medium text-gray-200 mb-3 sm:mb-4">{{ $t('settings.soundMapping.title') }}</h3>
          
          <!-- Default Sound Selection -->
          <div class="mb-4 sm:mb-6">
            <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-2">{{ $t('settings.soundMapping.defaultSound') }}</label>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <select 
                v-model="defaultSound"
                class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option v-for="sound in availableSounds" :key="sound" :value="sound">
                  {{ sound }}
                </option>
              </select>
              <button 
                @click="testSound(defaultSound)"
                class="px-3 py-2 text-gray-400 hover:text-gray-200 transition-colors inline-flex items-center justify-center gap-2 rounded-md"
                :title="$t('settings.soundMapping.test')"
              >
                <i class="mdi mdi-volume-high text-lg"></i>
                {{ $t('settings.soundMapping.test') }}
              </button>
            </div>
            <p class="mt-2 text-xs sm:text-sm text-gray-400">
              {{ $t('settings.soundMapping.defaultHint') }}
            </p>
          </div>

          <!-- Add New Sound Mapping -->
          <div class="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div class="flex flex-col gap-2 sm:gap-4">
              <div class="flex-1">
                <label class="block text-xs sm:text-sm font-medium text-gray-300 mb-2">{{ $t('settings.soundMapping.selectKeyword') }}</label>
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <select 
                    v-model="selectedKeyword"
                    class="flex-1 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">{{ $t('settings.soundMapping.selectPlaceholder') }}</option>
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
                    class="w-full sm:w-48 px-2 sm:px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option v-for="sound in availableSounds" :key="sound" :value="sound">
                      {{ sound }}
                    </option>
                  </select>
                  <button 
                    @click="addNewSoundMapping"
                    class="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    :disabled="!selectedKeyword"
                  >
                    {{ $t('settings.soundMapping.add') }}
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
              class="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm bg-blue-900/40 text-blue-300 break-all"
            >
              {{ mapping.keywords[0] }} → {{ mapping.soundFile }}
              <button 
                @click="testSound(mapping.soundFile)"
                class="ml-1 sm:ml-2 text-gray-400 hover:text-gray-200 transition-colors inline-flex items-center rounded-md"
                :title="$t('settings.soundMapping.test')"
              >
                <i class="mdi mdi-volume-high text-base sm:text-lg"></i>
              </button>
              <button 
                @click="toggleMapping(index)"
                :class="[
                  'ml-1 focus:outline-none rounded-md',
                  mapping.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
                ]"
                :title="mapping.enabled ? $t('settings.soundMapping.disable') : $t('settings.soundMapping.enable')"
              >
                <i class="mdi text-base sm:text-lg" :class="[mapping.enabled ? 'mdi-check' : 'mdi-close']"></i>
              </button>
              <button 
                @click="removeSoundMapping(index)"
                class="ml-1 sm:ml-2 text-red-400 hover:text-red-200 focus:outline-none rounded-md"
                :title="$t('settings.soundMapping.remove')"
              >
                <i class="mdi mdi-close text-base sm:text-lg"></i>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import type { SoundMapping, Channel } from '@/stores/settingsStore';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'SettingsView',
  setup() {
    const settingsStore = useSettingsStore();
    const { messageLimit, keywords, channels, soundMappings, availableSounds, defaultSound, language } = storeToRefs(settingsStore);
    const { t } = useI18n();
    
    // Load settings when component is mounted
    onMounted(() => {
      console.log('Component mounted, loading settings...');
      settingsStore.loadSettings();
      console.log('Settings loaded:', {
        messageLimit: messageLimit.value,
        keywords: keywords.value,
        channels: channels.value,
        soundMappings: soundMappings.value,
        defaultSound: defaultSound.value,
        language: language.value,
        availableSounds: availableSounds.value
      });
    });

    const newKeyword = ref('');
    const newChannelName = ref('');
    const newChannelId = ref('');
    const selectedKeyword = ref('');
    const newMappingSound = ref(availableSounds.value[0] || '');
    const editingIndex = ref(-1);

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
      if (newChannelName.value && newChannelId.value) {
        settingsStore.addChannel({
          name: newChannelName.value.trim(),
          id: newChannelId.value.trim()
        });
        newChannelName.value = '';
        newChannelId.value = '';
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
      language,
      newKeyword,
      newChannelName,
      newChannelId,
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