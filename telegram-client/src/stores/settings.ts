import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface SoundMapping {
  pattern: string;
  sound: string;
  enabled: boolean;
}

export interface Channel {
  name: string;
  id: string;
}

export const useSettingsStore = defineStore('settings', () => {
  const messageLimit = ref(100);
  const keywords = ref<string[]>([]);
  const channels = ref<Channel[]>([]);
  const defaultSound = ref('beep-10.mp3');
  const availableSounds = ref(['beep-10.mp3', 'beep-29.mp3', 'beep-30.mp3']);
  const soundMappings = ref<SoundMapping[]>([]);

  // Load settings from localStorage
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      messageLimit.value = settings.messageLimit || 100;
      keywords.value = settings.keywords || [];
      channels.value = settings.channels || [];
      defaultSound.value = settings.defaultSound || 'beep-10.mp3';
      soundMappings.value = settings.soundMappings || [];
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify({
      messageLimit: messageLimit.value,
      keywords: keywords.value,
      channels: channels.value,
      defaultSound: defaultSound.value,
      soundMappings: soundMappings.value
    }));
  };

  // Keywords management
  const addKeyword = (keyword: string) => {
    if (!keywords.value.includes(keyword)) {
      keywords.value.push(keyword);
      saveSettings();
    }
  };

  const removeKeyword = (keyword: string) => {
    const index = keywords.value.indexOf(keyword);
    if (index !== -1) {
      keywords.value.splice(index, 1);
      saveSettings();
    }
  };

  // Channels management
  const addChannel = (channel: Channel) => {
    if (!channels.value.some(c => c.id === channel.id)) {
      channels.value.push(channel);
      saveSettings();
    }
  };

  const removeChannel = (channelId: string) => {
    const index = channels.value.findIndex(c => c.id === channelId);
    if (index !== -1) {
      channels.value.splice(index, 1);
      saveSettings();
    }
  };

  // Sound mappings management
  const addSoundMapping = (pattern: string, sound: string) => {
    soundMappings.value.push({ pattern, sound, enabled: true });
    saveSettings();
  };

  const removeSoundMapping = (index: number) => {
    soundMappings.value.splice(index, 1);
    saveSettings();
  };

  const toggleSoundMapping = (index: number) => {
    if (soundMappings.value[index]) {
      soundMappings.value[index].enabled = !soundMappings.value[index].enabled;
      saveSettings();
    }
  };

  // Initialize settings
  loadSettings();

  return {
    messageLimit,
    keywords,
    channels,
    defaultSound,
    availableSounds,
    soundMappings,
    addKeyword,
    removeKeyword,
    addChannel,
    removeChannel,
    addSoundMapping,
    removeSoundMapping,
    toggleSoundMapping,
    saveSettings,
    loadSettings
  };
}); 