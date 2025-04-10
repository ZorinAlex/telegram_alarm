import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { i18n } from '@/i18n';

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
  console.log('Initializing settings store...');
  
  // Initialize with values from localStorage or defaults
  const savedSettings = localStorage.getItem('telegram-settings');
  console.log('Saved settings from localStorage:', savedSettings);
  
  const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
    messageLimit: 100,
    keywords: [],
    channels: [],
    soundMappings: [],
    defaultSound: 'beep-1.mp3',
    language: 'en'
  };
  
  console.log('Initial settings:', initialSettings);

  const messageLimit = ref(initialSettings.messageLimit);
  const keywords = ref<string[]>(initialSettings.keywords);
  const channels = ref<Channel[]>(initialSettings.channels);
  const soundMappings = ref<SoundMapping[]>(initialSettings.soundMappings);
  const defaultSound = ref(initialSettings.defaultSound || 'beep-1.mp3');
  const language = ref(initialSettings.language);
  
  // Available builtin sounds
  const builtinSounds = ref([
    'beep-1.mp3',
    'beep-2.mp3',
    'балістика.mp3',
    'балістика_київ.mp3',
    'вже_близько.mp3',
    'вокзал.mp3',
    'жуляни.mp3',
    'ракета.mp3',
    'солома.mp3',
    'тікай.mp3',
    'чоколівка.mp3',
    'шахед.mp3',
    'відрадний.mp3'
  ]);
  
  // Custom sounds loaded from user data directory
  const customSounds = ref<string[]>([]);
  
  // Combined available sounds (builtin + custom)
  const availableSounds = computed(() => {
    return [...builtinSounds.value, ...customSounds.value];
  });

  // Load custom sounds from disk
  const loadCustomSounds = async () => {
    if (window.api && window.api.sound) {
      try {
        const result = await window.api.sound.listCustom();
        if (result.success) {
          console.log('Custom sounds loaded:', result.sounds);
          customSounds.value = result.sounds;
        } else {
          console.error('Failed to load custom sounds:', result.error);
        }
      } catch (error) {
        console.error('Error loading custom sounds:', error);
      }
    }
  };

  // Import a new sound file
  const importSound = async (filePath: string): Promise<string | null> => {
    if (window.api && window.api.sound) {
      try {
        const result = await window.api.sound.import(filePath);
        if (result.success) {
          console.log('Sound imported successfully:', result.fileName);
          
          // Add to custom sounds if not already present
          if (!customSounds.value.includes(result.fileName)) {
            customSounds.value.push(result.fileName);
          }
          
          return result.fileName;
        } else {
          console.error('Failed to import sound:', result.error);
          return null;
        }
      } catch (error) {
        console.error('Error importing sound:', error);
        return null;
      }
    }
    return null;
  };

  // Watch for changes and save to localStorage
  watch(
    [messageLimit, keywords, channels, soundMappings, defaultSound, language],
    () => {
      const settingsToSave = {
        messageLimit: messageLimit.value,
        keywords: keywords.value,
        channels: channels.value,
        soundMappings: soundMappings.value,
        defaultSound: defaultSound.value,
        language: language.value
      };
      console.log('Saving settings to localStorage:', settingsToSave);
      localStorage.setItem('telegram-settings', JSON.stringify(settingsToSave));
    },
    { deep: true }
  );

  // Watch language changes and update i18n locale
  watch(language, (newLanguage) => {
    i18n.global.locale.value = newLanguage;
  });

  // Load settings from localStorage
  const loadSettings = async () => {
    console.log('Loading settings from localStorage...');
    const savedSettings = localStorage.getItem('telegram-settings');
    console.log('Retrieved settings:', savedSettings);
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      console.log('Parsed settings:', settings);
      
      messageLimit.value = settings.messageLimit ?? 100;
      keywords.value = settings.keywords ?? [];
      channels.value = settings.channels ?? [];
      defaultSound.value = settings.defaultSound || 'beep-1.mp3';
      soundMappings.value = settings.soundMappings ?? [];
      language.value = settings.language ?? 'en';
      
      // Set initial i18n locale
      i18n.global.locale.value = language.value;
      
      console.log('Settings loaded:', {
        messageLimit: messageLimit.value,
        keywords: keywords.value,
        channels: channels.value,
        soundMappings: soundMappings.value,
        defaultSound: defaultSound.value,
        language: language.value,
        availableSounds: availableSounds.value
      });
    }
    
    // Load custom sounds
    await loadCustomSounds();
  };

  const addKeyword = (keyword: string) => {
    if (!keywords.value.includes(keyword)) {
      keywords.value.push(keyword);
      console.log('Added keyword:', keyword);
      console.log('Current keywords:', keywords.value);
    }
  };

  const removeKeyword = (index: number) => {
    const removed = keywords.value.splice(index, 1);
    console.log('Removed keyword:', removed);
    console.log('Current keywords:', keywords.value);
  };

  const addChannel = (channel: Channel) => {
    if (!channels.value.some(ch => ch.id === channel.id)) {
      channels.value.push(channel);
      console.log('Added channel:', channel);
      console.log('Current channels:', channels.value);
    }
  };

  const removeChannel = (index: number) => {
    const removed = channels.value.splice(index, 1);
    console.log('Removed channel:', removed);
    console.log('Current channels:', channels.value);
  };

  const addSoundMapping = (mapping: SoundMapping) => {
    soundMappings.value.push(mapping);
    console.log('Added sound mapping:', mapping);
    console.log('Current sound mappings:', soundMappings.value);
  };

  const removeSoundMapping = (index: number) => {
    const removed = soundMappings.value.splice(index, 1);
    console.log('Removed sound mapping:', removed);
    console.log('Current sound mappings:', soundMappings.value);
  };

  const updateSoundMapping = (index: number, mapping: SoundMapping) => {
    soundMappings.value[index] = mapping;
    console.log('Updated sound mapping at index', index, ':', mapping);
    console.log('Current sound mappings:', soundMappings.value);
  };

  const setLanguage = (newLanguage: string) => {
    language.value = newLanguage;
    console.log('Language changed to:', newLanguage);
  };

  // Load settings on store initialization
  loadSettings();

  return {
    messageLimit,
    keywords,
    channels,
    soundMappings,
    availableSounds,
    defaultSound,
    language,
    addKeyword,
    removeKeyword,
    addChannel,
    removeChannel,
    addSoundMapping,
    removeSoundMapping,
    updateSoundMapping,
    setLanguage,
    loadSettings,
    loadCustomSounds,
    importSound
  };
}); 