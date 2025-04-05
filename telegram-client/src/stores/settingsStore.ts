import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
  const messageLimit = ref(parseInt(localStorage.getItem('messageLimit') || '50'));
  const keywords = ref<string[]>(JSON.parse(localStorage.getItem('telegramKeywords') || '["solana", "pump", "airdrop"]'));
  const channels = ref<string[]>(JSON.parse(localStorage.getItem('telegramChannels') || '[]'));

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

  return {
    messageLimit,
    keywords,
    channels,
    addKeyword,
    removeKeyword,
    addChannel,
    removeChannel
  };
}); 