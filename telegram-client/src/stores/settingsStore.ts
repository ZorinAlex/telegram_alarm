import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export interface SoundMapping {
  keywords: string[];
  soundFile: string;
  enabled: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
  const messageLimit = ref(parseInt(localStorage.getItem('messageLimit') || '50'));
  const keywords = ref<string[]>(JSON.parse(localStorage.getItem('telegramKeywords') || '["solana", "pump", "airdrop"]'));
  const channels = ref<string[]>(JSON.parse(localStorage.getItem('telegramChannels') || '[]'));
  const soundMappings = ref<SoundMapping[]>(JSON.parse(localStorage.getItem('telegramSoundMappings') || '[]'));
  const availableSounds = ref<string[]>(['beep-10.mp3', 'button-20.mp3']);
  
  // Ensure default sound is always set to first available sound if not already set
  const storedDefaultSound = localStorage.getItem('telegramDefaultSound');
  const defaultSound = ref<string>(
    storedDefaultSound && availableSounds.value.includes(storedDefaultSound) 
      ? storedDefaultSound 
      : availableSounds.value[0]
  );

  // Save initial default sound if not already set
  if (!storedDefaultSound || !availableSounds.value.includes(storedDefaultSound)) {
    localStorage.setItem('telegramDefaultSound', defaultSound.value);
  }

  // Watch for changes and save to localStorage
  watch(messageLimit, (newLimit) => {
    localStorage.setItem('messageLimit', newLimit.toString());
  });

  watch(keywords, (newKeywords) => {
    localStorage.setItem('telegramKeywords', JSON.stringify(newKeywords));
  }, { deep: true });

  watch(channels, (newChannels) => {
    localStorage.setItem('telegramChannels', JSON.stringify(newChannels));
  }, { deep: true });

  watch(soundMappings, (newMappings) => {
    localStorage.setItem('telegramSoundMappings', JSON.stringify(newMappings));
  }, { deep: true });

  watch(defaultSound, (newSound) => {
    // Only allow setting default sound to an available sound
    if (availableSounds.value.includes(newSound)) {
      localStorage.setItem('telegramDefaultSound', newSound);
    } else {
      // Reset to first available sound if invalid
      defaultSound.value = availableSounds.value[0];
      localStorage.setItem('telegramDefaultSound', availableSounds.value[0]);
    }
  });

  // Watch available sounds to ensure default sound remains valid
  watch(availableSounds, (newSounds) => {
    if (!newSounds.includes(defaultSound.value)) {
      defaultSound.value = newSounds[0];
      localStorage.setItem('telegramDefaultSound', newSounds[0]);
    }
  });

  const addKeyword = (keyword: string) => {
    if (keyword && !keywords.value.includes(keyword)) {
      keywords.value.push(keyword);
    }
  };

  const removeKeyword = (index: number) => {
    keywords.value.splice(index, 1);
  };

  const addChannel = (channel: string) => {
    if (channel && !channels.value.includes(channel)) {
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

  const setDefaultSound = (soundFile: string) => {
    if (availableSounds.value.includes(soundFile)) {
      defaultSound.value = soundFile;
    } else {
      defaultSound.value = availableSounds.value[0];
    }
  };

  const addAvailableSound = (soundFile: string) => {
    if (!availableSounds.value.includes(soundFile)) {
      availableSounds.value.push(soundFile);
      localStorage.setItem('telegramAvailableSounds', JSON.stringify(availableSounds.value));
    }
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
    updateSoundMapping,
    setDefaultSound,
    addAvailableSound
  };
}); 