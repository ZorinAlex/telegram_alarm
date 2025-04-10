/**
 * Telegram Service module for Electron main process
 * Handles Telegram API communication between renderer and main processes
 */

class TelegramService {
  constructor() {
    this.initialized = false;
    this.client = null;
    console.log('TelegramService initialized');
  }

  /**
   * Initialize the Telegram client
   * @param {Object} credentials - Telegram API credentials
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(credentials) {
    try {
      console.log('Initializing TelegramService');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing TelegramService:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Check if client is logged in
   * @returns {boolean} - Login status
   */
  isLoggedIn() {
    return this.initialized;
  }
}

// Export a singleton instance
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new TelegramService();
    }
    return instance;
  }
}; 