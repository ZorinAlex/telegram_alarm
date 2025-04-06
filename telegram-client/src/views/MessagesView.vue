<!-- MessagesView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-200 px-2 sm:px-0">{{ $t('messages.title') }}</h1>
    
    <div class="bg-gray-800 shadow rounded-none sm:rounded-lg overflow-hidden">
      <div class="p-2 sm:p-4">
        <div class="flex flex-col sm:flex-row sm:justify-end mb-2 sm:mb-4 items-start sm:items-center gap-2 sm:gap-4">
          <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <label class="text-sm text-gray-300">{{ $t('messages.showMatchedOnly') }}</label>
            <button
              @click="showMatchedOnly = !showMatchedOnly"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="[showMatchedOnly ? 'bg-blue-600' : 'bg-gray-600']"
            >
              <span class="sr-only">{{ $t('messages.showMatchedOnly') }}</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="[showMatchedOnly ? 'translate-x-6' : 'translate-x-1']"
              />
            </button>
          </div>
          <button 
            @click="testSound(defaultSound)"
            class="w-full sm:w-auto px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
          >
            <i class="mdi mdi-volume-high text-lg"></i>
            {{ $t('messages.notificationSound') }}
          </button>
        </div>
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-4 text-gray-400">
          {{ $t('messages.loading') }}
        </div>
        <!-- Messages list -->
        <template v-else>
          <div class="space-y-2 sm:space-y-4">
            <div 
              v-for="message in limitedMessages" 
              :key="message.id"
              class="p-2 sm:p-4 bg-gray-700 rounded-lg"
              :class="{ 'border border-blue-500': hasKeywords(message.text) }"
            >
              <div class="flex flex-col gap-1 sm:gap-2">
                <div class="flex flex-wrap sm:flex-nowrap gap-2 text-xs sm:text-sm text-gray-400 items-center">
                  <div class="flex flex-wrap gap-2 flex-grow">
                    <span class="font-medium text-gray-300">
                      {{ message.sender !== 'Unknown' ? message.sender : (message.chat !== 'Unknown Chat' ? (message.chat + ' (ID: ' + message.chatId + ')') : '') }}
                    </span>
                    <span>{{ $t('messages.id') }}: {{ message.id }}</span>
                    <span v-if="message.sender !== 'Unknown' && message.chat !== 'Unknown Chat'" class="text-blue-400">{{ message.chat }} (ID: {{ message.chatId }})</span>
                  </div>
                  <span class="hidden sm:block whitespace-nowrap">{{ new Date(message.date).toLocaleString() }}</span>
                  <span class="sm:hidden">{{ new Date(message.date).toLocaleString() }}</span>
                </div>
                <div class="text-sm sm:text-base text-gray-200">{{ message.text }}</div>
                <div v-if="hasKeywords(message.text)" class="text-xs sm:text-sm text-blue-400">
                  {{ $t('messages.matchedKeywords') }}: {{ getMatchedKeywords(message.text).join(', ') }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="!isLoading && messages.length === 0" class="text-center py-4 text-gray-400">
            {{ $t('messages.noMessages') }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { TelegramService } from '@/services/TelegramService';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

interface Message {
  id: number;
  senderId: string | number;
  chatId: string | number;
  sender: string;
  text: string;
  date: number;
  chat?: string;
}

export default defineComponent({
  name: 'MessagesView',
  setup() {
    const router = useRouter();
    const telegramService = TelegramService.getInstance();
    const settingsStore = useSettingsStore();
    const { messageLimit, keywords, channels, soundMappings, defaultSound } = storeToRefs(settingsStore);
    const { t } = useI18n();
    const messages = ref<Message[]>([]);
    const notificationSounds = ref<{ [key: string]: HTMLAudioElement }>({});
    const audioPermissionGranted = ref(false);
    const isLoading = ref(true);
    const showMatchedOnly = ref(false);

    // Initialize audio context and request permission
    const initializeAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        audioPermissionGranted.value = true;

        // Initialize all sound files
        settingsStore.availableSounds.forEach(soundFile => {
          notificationSounds.value[soundFile] = new Audio(`/${soundFile}`);
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Load saved messages
    const loadSavedMessages = () => {
      try {
        const savedMessages = localStorage.getItem('telegramMessages');
        if (savedMessages) {
          messages.value = JSON.parse(savedMessages);
          console.log('Loaded messages from storage:', messages.value);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    // Initialize client and start monitoring
    const initializeClient = async () => {
      try {
        await telegramService.initializeClient();
        await telegramService.login('');
        await telegramService.startMessageMonitoring();
        
        // Start listening for new messages
        telegramService.onMessage((message: any) => {
          console.log('New message received in view:', message);
          const newMessage: Message = {
            id: message.id,
            senderId: message.senderId,
            chatId: message.chatId,
            sender: message.sender,
            text: message.text,
            chat: message.chat,
            date: message.date * 1000,
          };
          console.log('Processed new message in view:', newMessage);

          // Check if message is from an excluded channel
          const isExcluded = channels.value.some(channel => 
            newMessage.chatId?.toString() === channel.id
          );

          if (!isExcluded) {
            if (hasKeywords(newMessage.text)) {
              playNotificationSound(newMessage.text);
            }

            messages.value = [newMessage, ...messages.value];
            // Trim messages array after adding new message
            if (messages.value.length > messageLimit.value * 2) {
              messages.value = messages.value.slice(0, messageLimit.value);
            }
            saveMessages();
          }
        });

        return true;
      } catch (error) {
        console.error('Error initializing client:', error);
        return false;
      }
    };

    onMounted(async () => {
      console.log('Component mounted');
      isLoading.value = true;

      try {
        if (!telegramService.isLoggedIn()) {
          console.log('Not logged in, redirecting to login');
          router.push('/login');
          return;
        }

        // First load saved messages
        loadSavedMessages();
        // Set loading to false after messages are loaded
        isLoading.value = false;

        // Initialize audio in background
        initializeAudio().catch(error => {
          console.warn('Audio initialization failed, will retry on user interaction:', error);
        });

        // Initialize client in background
        initializeClient().catch(error => {
          console.error('Error initializing client:', error);
          router.push('/login');
        });

      } catch (error) {
        console.error('Error during initialization:', error);
        isLoading.value = false;
        router.push('/login');
      }
    });

    // Compute limited messages based on settings and filters
    const limitedMessages = computed(() => {
      console.log('Computing limited messages');
      console.log('Current messages:', messages.value);
      console.log('Current channels to exclude:', channels.value);
      console.log('Current message limit:', messageLimit.value);
      console.log('Show matched only:', showMatchedOnly.value);
      
      let filteredMessages = messages.value;
      
      // Apply channel filter to exclude specified channels
      if (channels.value.length > 0) {
        console.log('Applying channel exclusion filter');
        filteredMessages = filteredMessages.filter(message => 
          !channels.value.some(channel => 
            message.chatId?.toString() === channel.id
          )
        );
        console.log('After channel exclusion filter:', filteredMessages);
      }

      // Apply keyword filter if showMatchedOnly is true
      if (showMatchedOnly.value) {
        console.log('Applying keyword filter');
        filteredMessages = filteredMessages.filter(message => hasKeywords(message.text));
        console.log('After keyword filter:', filteredMessages);
      }

      // Return limited number of filtered messages
      const result = filteredMessages.slice(0, messageLimit.value);
      console.log('Final filtered messages:', result);
      return result;
    });

    // Save messages to local storage whenever they change
    const saveMessages = () => {
      // Only save up to messageLimit messages after applying filters
      const messagesToSave = messages.value.filter(message =>
        !channels.value.some(channel => message.chatId?.toString() === channel.id)
      ).slice(0, messageLimit.value);
      localStorage.setItem('telegramMessages', JSON.stringify(messagesToSave));
    };

    // Check if message contains any keywords
    const hasKeywords = (text: string): boolean => {
      // If no keywords are selected, all messages should pass
      if (keywords.value.length === 0) return false;
      
      return keywords.value.some(keyword => {
        // Split keyword into individual words and filter out empty strings
        const keywordWords = keyword.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const messageText = text.toLowerCase();
        
        // For single word keywords, use simple includes
        if (keywordWords.length === 1) {
          return messageText.includes(keywordWords[0]);
        }
        
        // For multi-word keywords, check each word exists in order but allow other words between
        let lastIndex = -1;
        return keywordWords.every(word => {
          const index = messageText.indexOf(word);
          if (index === -1) return false; // Word not found at all
          return true; // Word found
        });
      });
    };

    // Get matched keywords for a message
    const getMatchedKeywords = (text: string): string[] => {
      return keywords.value.filter(keyword => {
        // Split keyword into individual words and filter out empty strings
        const keywordWords = keyword.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const messageText = text.toLowerCase();
        
        // For single word keywords, use simple includes
        if (keywordWords.length === 1) {
          return messageText.includes(keywordWords[0]);
        }
        
        // For multi-word keywords, check each word exists in order but allow other words between
        let lastIndex = -1;
        return keywordWords.every(word => {
          const index = messageText.indexOf(word);
          if (index === -1) return false; // Word not found at all
          return true; // Word found
        });
      });
    };

    // Play notification sound if message matches keywords
    const playNotificationSound = async (text: string) => {
      try {
        if (!audioPermissionGranted.value) {
          await initializeAudio();
        }

        // Get all matching keywords
        const matchedKeywords = keywords.value.filter(keyword => {
          // Split keyword into individual words and filter out empty strings
          const keywordWords = keyword.toLowerCase().split(/\s+/).filter(word => word.length > 0);
          const messageText = text.toLowerCase();
          
          // For single word keywords, use simple includes
          if (keywordWords.length === 1) {
            return messageText.includes(keywordWords[0]);
          }
          
          // For multi-word keywords, check each word exists in order but allow other words between
          let lastIndex = -1;
          return keywordWords.every(word => {
            const index = messageText.indexOf(word);
            if (index === -1) return false; // Word not found at all
            return true; // Word found
          });
        });

        if (matchedKeywords.length > 0) {
          // Find all matching sound mappings
          const matchingSounds = matchedKeywords.map(keyword => {
            const mapping = soundMappings.value.find(mapping => 
              mapping.enabled && mapping.keywords.includes(keyword)
            );
            return mapping ? mapping.soundFile : defaultSound.value;
          });

          // Play sounds sequentially
          for (const soundFile of matchingSounds) {
            const sound = notificationSounds.value[soundFile];
            if (sound) {
              sound.currentTime = 0;
              await sound.play();
              // Wait for the sound to finish before playing the next one
              await new Promise(resolve => {
                sound.onended = resolve;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error playing notification sound:', error);
        audioPermissionGranted.value = false;
      }
    };

    // Test specific sound
    const testSound = async (soundFile: string) => {
      try {
        if (!audioPermissionGranted.value) {
          await initializeAudio();
        }
        const sound = notificationSounds.value[soundFile];
        if (sound) {
          sound.currentTime = 0;
          await sound.play();
        }
      } catch (error) {
        console.error('Error playing test sound:', error);
        audioPermissionGranted.value = false;
      }
    };

    // Watch for changes in message limit and update storage
    watch(() => messageLimit.value, saveMessages);

    return {
      messages,
      limitedMessages,
      hasKeywords,
      getMatchedKeywords,
      testSound,
      isLoading,
      showMatchedOnly,
      defaultSound
    };
  },
});
</script>

<style scoped>
.messages-view {
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

.header-buttons {
  display: flex;
  gap: 1rem;
}

.settings-button {
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

.settings-button:hover {
  background-color: #2563eb;
}

.logout-button {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #dc2626;
}

.messages-list {
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-item {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.message-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-item.has-keywords {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.message-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.sender {
  font-weight: 600;
  color: #0369a1;
}

.message-content {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.matched-keywords {
  font-size: 0.875rem;
  color: #3b82f6;
  background: #dbeafe;
  padding: 0.5rem;
  border-radius: 6px;
}

@media (prefers-color-scheme: dark) {
  .messages-list {
    background: #2d2d2d;
  }

  .message-item {
    background: #2d2d2d;
    border-color: #4d4d4d;
  }

  .message-item.has-keywords {
    background-color: #1e3a8a;
  }

  .matched-keywords {
    background: #1e3a8a;
    color: #93c5fd;
  }
}
</style> 