import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    header: {
      title: 'Telegram Monitor',
      messages: 'Messages',
      settings: 'Settings',
      logout: 'Logout'
    },
    login: {
      title: 'Login to Telegram',
      phoneNumber: 'Phone Number',
      phoneNumberPlaceholder: '+1234567890',
      verificationCode: 'Verification Code',
      verificationCodePlaceholder: 'Enter code from Telegram',
      password: '2FA Password',
      passwordPlaceholder: 'Enter your 2FA password',
      loginButton: 'Login',
      submitCodeButton: 'Submit Code & Password',
      loading: 'Loading...',
      loginSuccess: 'Login successful! You can now proceed to messages.',
      goToMessages: 'Go to Messages'
    },
    messages: {
      title: 'Messages',
      showMatchedOnly: 'Show matched only',
      notificationSound: 'Notification Sound',
      loading: 'Loading messages...',
      noMessages: 'No messages yet',
      matchedKeywords: 'Matched keywords',
      id: 'ID',
      unknownChat: 'Unknown Chat'
    },
    settings: {
      title: 'Settings',
      language: {
        title: 'Language',
        english: 'English',
        ukrainian: 'Ukrainian',
        hint: 'Choose your preferred language for the interface'
      },
      messageDisplay: {
        title: 'Message Display',
        placeholder: 'Number of messages to display',
        hint: 'This setting determines how many recent messages will be shown and stored locally'
      },
      keywords: {
        title: 'Message Filtering',
        placeholder: 'Add new keyword',
        add: 'Add',
        remove: 'Remove keyword',
        hint: 'Messages containing these keywords will be highlighted'
      },
      channels: {
        title: 'Excluded Channels',
        namePlaceholder: 'Channel name',
        idPlaceholder: 'Channel ID',
        add: 'Add',
        remove: 'Remove channel',
        hint: 'Messages from these channels will be hidden'
      },
      soundMapping: {
        title: 'Sound Notifications',
        defaultSound: 'Default Sound',
        test: 'Test',
        defaultHint: 'This sound plays for messages with keywords but no specific mapping',
        selectKeyword: 'Select Keyword',
        selectPlaceholder: 'Select a keyword',
        add: 'Add',
        remove: 'Remove sound mapping',
        enable: 'Enable',
        disable: 'Disable'
      }
    }
  },
  ua: {
    header: {
      title: 'Telegram Монітор',
      messages: 'Повідомлення',
      settings: 'Налаштування',
      logout: 'Вийти'
    },
    login: {
      title: 'Вхід в Telegram',
      phoneNumber: 'Номер телефону',
      phoneNumberPlaceholder: '+380XXXXXXXXX',
      verificationCode: 'Код підтвердження',
      verificationCodePlaceholder: 'Введіть код з Telegram',
      password: 'Пароль 2FA',
      passwordPlaceholder: 'Введіть ваш пароль 2FA',
      loginButton: 'Увійти',
      submitCodeButton: 'Відправити код і пароль',
      loading: 'Завантаження...',
      loginSuccess: 'Вхід успішний! Тепер ви можете перейти до повідомлень.',
      goToMessages: 'Перейти до повідомлень'
    },
    messages: {
      title: 'Повідомлення',
      showMatchedOnly: 'Показати тільки збіги',
      notificationSound: 'Звук сповіщення',
      loading: 'Завантаження повідомлень...',
      noMessages: 'Немає повідомлень',
      matchedKeywords: 'Знайдені ключові слова',
      id: 'ID',
      unknownChat: 'Невідомий чат'
    },
    settings: {
      title: 'Налаштування',
      language: {
        title: 'Мова',
        english: 'Англійська',
        ukrainian: 'Українська',
        hint: 'Оберіть мову інтерфейсу'
      },
      messageDisplay: {
        title: 'Відображення повідомлень',
        placeholder: 'Кількість повідомлень для відображення',
        hint: 'Це налаштування визначає, скільки останніх повідомлень буде показано та збережено локально'
      },
      keywords: {
        title: 'Фільтрація повідомлень',
        placeholder: 'Додати нове ключове слово',
        add: 'Додати',
        remove: 'Видалити ключове слово',
        hint: 'Повідомлення, що містять ці ключові слова, будуть виділені'
      },
      channels: {
        title: 'Виключені канали',
        namePlaceholder: 'Назва каналу',
        idPlaceholder: 'ID каналу',
        add: 'Додати',
        remove: 'Видалити канал',
        hint: 'Повідомлення з цих каналів будуть приховані'
      },
      soundMapping: {
        title: 'Звукові сповіщення',
        defaultSound: 'Звук за замовчуванням',
        test: 'Тест',
        defaultHint: 'Цей звук відтворюється для повідомлень з ключовими словами без спеціального призначення',
        selectKeyword: 'Виберіть ключове слово',
        selectPlaceholder: 'Виберіть ключове слово',
        add: 'Додати',
        remove: 'Видалити звукове призначення',
        enable: 'Увімкнути',
        disable: 'Вимкнути'
      }
    }
  }
};

// Get initial locale from settings
const savedSettings = localStorage.getItem('telegram-settings');
const initialLocale = savedSettings ? JSON.parse(savedSettings).language || 'ua' : 'ua';

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'ua',
  messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
}); 