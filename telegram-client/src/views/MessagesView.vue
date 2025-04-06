<!-- MessagesView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="p-4">
        <div class="flex justify-end mb-4 items-center gap-4">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-300">Show matched only</label>
            <button
              @click="showMatchedOnly = !showMatchedOnly"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="[showMatchedOnly ? 'bg-blue-600' : 'bg-gray-600']"
            >
              <span class="sr-only">Show matched messages only</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="[showMatchedOnly ? 'translate-x-6' : 'translate-x-1']"
              />
            </button>
          </div>
          <button 
            @click="testSound('beep-10.mp3')" 
            class="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <i class="mdi mdi-volume-high text-lg"></i>
            Notification Sound
          </button>
        </div>
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-4 text-gray-400">
          Loading messages...
        </div>
        <!-- Messages list -->
        <template v-else>
          <div 
            v-for="message in limitedMessages" 
            :key="message.id" 
            class="border-b border-gray-700 last:border-0 pb-4 last:pb-0 mb-4"
            :class="[hasKeywords(message.text) ? 'bg-blue-900/20' : '']"
          >
            <div class="flex items-start px-4">
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-200">
                    <template v-if="message.chat === 'Unknown Chat'">
                      {{ message.sender }} <span class="text-xs text-gray-400">(ID: {{ message.senderId }})</span>
                    </template>
                    <template v-else>
                      <span>{{ message.chat }} <span class="text-xs text-gray-400">(ID: {{ message.chatId }})</span></span>
                    </template>
                  </p>
                  <div class="flex items-center gap-3 text-sm text-gray-400">
                    <template v-if="message.chat === 'Unknown Chat'">
                      <span>{{ message.chat }} <span class="text-xs">(ID: {{ message.chatId }})</span></span>
                    </template>
                    <template v-else>
                      {{ message.sender }} <span class="text-xs">(ID: {{ message.senderId }})</span>
                    </template>
                    <span>{{ new Date(message.date).toLocaleString() }}</span>
                  </div>
                </div>
                <div class="mt-3 text-sm text-gray-300">
                  {{ message.text }}
                </div>
                <div 
                  v-if="getMatchedKeywords(message.text).length > 0"
                  class="mt-3 text-sm bg-blue-900/40 text-blue-300 px-3 py-1.5 rounded-md inline-block"
                >
                  Matched keywords: {{ getMatchedKeywords(message.text).join(', ') }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="!isLoading && messages.length === 0" class="text-center py-4 text-gray-400">
            No messages yet
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
      
      return keywords.value.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
    };

    // Get matched keywords for a message
    const getMatchedKeywords = (text: string): string[] => {
      return keywords.value.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
    };

    // Play notification sound if message matches keywords
    const playNotificationSound = async (text: string) => {
      try {
        if (!audioPermissionGranted.value) {
          await initializeAudio();
        }

        // Check if any keywords match
        const hasMatchingKeywords = keywords.value.some(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase())
        );

        if (hasMatchingKeywords) {
          // Find matching sound mapping
          const matchingMapping = soundMappings.value.find(mapping => 
            mapping.enabled && mapping.keywords.some(keyword => 
              text.toLowerCase().includes(keyword.toLowerCase())
            )
          );

          // Use either the matching sound or default sound
          const soundToPlay = matchingMapping ? 
            notificationSounds.value[matchingMapping.soundFile] : 
            notificationSounds.value[defaultSound.value];

          if (soundToPlay) {
            soundToPlay.currentTime = 0;
            await soundToPlay.play();
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