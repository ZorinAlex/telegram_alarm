import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface SoundMapping {
  keywords: string[];
  soundFile: string;
  enabled: boolean;
}

export interface Channel {
  name: string;
  id: string;
}

export const useSettingsStore = defineStore('settings', () => {
  // Initialize with values from localStorage or defaults
  const savedSettings = localStorage.getItem('telegram-settings');
  const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
    messageLimit: 10,
    keywords: [],
    channels: [],
    soundMappings: [],
    defaultSound: 'beep-10.mp3'
  };

  const messageLimit = ref(initialSettings.messageLimit);
  const keywords = ref<string[]>(initialSettings.keywords);
  const channels = ref<Channel[]>(initialSettings.channels);
  const soundMappings = ref<SoundMapping[]>(initialSettings.soundMappings);
  const defaultSound = ref(initialSettings.defaultSound);
  const availableSounds = ref([
    'beep-10.mp3',
    'button-20.mp3',
  ]);

  // Watch for changes and save to localStorage
  watch(
    [messageLimit, keywords, channels, soundMappings, defaultSound],
    ([newLimit, newKeywords, newChannels, newMappings, newSound]) => {
      localStorage.setItem('telegram-settings', JSON.stringify({
        messageLimit: newLimit,
        keywords: newKeywords,
        channels: newChannels,
        soundMappings: newMappings,
        defaultSound: newSound
      }));
    },
    { deep: true }
  );

  const addKeyword = (keyword: string) => {
    if (!keywords.value.includes(keyword)) {
      keywords.value.push(keyword);
    }
  };

  const removeKeyword = (index: number) => {
    keywords.value.splice(index, 1);
  };

  const addChannel = (channel: Channel) => {
    if (!channels.value.some(ch => ch.id === channel.id)) {
      channels.value.push(channel);
    }
  };

  const removeChannel = (index: number) => {
    channels.value.splice(index, 1);
  };

  const addSoundMapping = (mapping: SoundMapping) => {
    soundMappings.value.push(mapping);
  };

  const removeSoundMapping = (index: number) => {
    soundMappings.value.splice(index, 1);
  };

  const updateSoundMapping = (index: number, mapping: SoundMapping) => {
    soundMappings.value[index] = mapping;
  };

  return {
    messageLimit,
    keywords,
    channels,
    soundMappings,
    availableSounds,
    defaultSound,
    addKeyword,
    removeKeyword,
    addChannel,
    removeChannel,
    addSoundMapping,
    removeSoundMapping,
    updateSoundMapping
  };
}); 