<!-- MessagesView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="p-4">
        <div class="flex justify-end mb-4">
          <button 
            @click="testSound('beep-10.mp3')" 
            class="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Test Notification Sound
          </button>
        </div>
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
                  {{ message.sender }}
                </p>
                <div class="flex items-center gap-3 text-sm text-gray-400">
                  <span v-if="message.chat">{{ message.chat }}</span>
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
        <div v-if="messages.length === 0" class="text-center py-4 text-gray-400">
          No messages yet
        </div>
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
    let audioPermissionGranted = ref(false);

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

    // Load messages from local storage on mount
    onMounted(async () => {
      console.log('Component mounted');
      if (!telegramService.isLoggedIn()) {
        console.log('Not logged in, redirecting to login');
        router.push('/login');
        return;
      }

      // Load audio context
      await initializeAudio();

      const savedMessages = localStorage.getItem('telegramMessages');
      console.log('Saved messages from storage:', savedMessages);
      if (savedMessages) {
        messages.value = JSON.parse(savedMessages);
        console.log('Loaded messages into state:', messages.value);
      }

      try {
        // Initialize client first
        await telegramService.initializeClient();
        
        // Try to login with saved session
        await telegramService.login('');
        
        // Then start message monitoring
        await telegramService.startMessageMonitoring();
        
        // Start listening for new messages
        telegramService.onMessage((message: any) => {
          console.log('New message received in view:', message);
          const newMessage: Message = {
            id: message.id,
            sender: message.sender,
            text: message.text,
            chat: message.chat,
            date: message.date * 1000, // Convert to milliseconds
          };
          console.log('Processed new message in view:', newMessage);

          // Play notification sound if message matches any sound mapping
          playNotificationSound(newMessage.text);

          messages.value = [newMessage, ...messages.value];
          console.log('Updated messages array:', messages.value);
          saveMessages();
        });
      } catch (error) {
        console.error('Error starting message monitoring:', error);
        router.push('/login');
      }
    });

    // Compute limited messages based on settings and filters
    const limitedMessages = computed(() => {
      console.log('Computing limited messages');
      console.log('Current messages:', messages.value);
      console.log('Current channels:', channels.value);
      console.log('Current message limit:', messageLimit.value);
      
      let filteredMessages = messages.value;
      
      // Apply channel filter if channels are specified
      if (channels.value.length > 0) {
        console.log('Applying channel filter');
        filteredMessages = filteredMessages.filter(message => 
          channels.value.some(channel => 
            message.chat?.toLowerCase().includes(channel.toLowerCase())
          )
        );
        console.log('After channel filter:', filteredMessages);
      }

      // Return limited number of filtered messages
      const result = filteredMessages.slice(0, messageLimit.value);
      console.log('Final filtered messages:', result);
      return result;
    });

    // Save messages to local storage whenever they change
    const saveMessages = () => {
      localStorage.setItem('telegramMessages', JSON.stringify(messages.value.slice(0, messageLimit.value)));
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