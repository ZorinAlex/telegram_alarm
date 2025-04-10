const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Expose methods for Telegram functionality
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['telegram:login', 'telegram:message', 'telegram:logout'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['telegram:response', 'telegram:error', 'telegram:message-received'];
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // File system access for sounds
    readFile: (filePath) => {
      return ipcRenderer.invoke('file:read', filePath);
    },
    // Local storage alternative
    store: {
      get: (key) => ipcRenderer.invoke('store:get', key),
      set: (key, value) => ipcRenderer.invoke('store:set', key, value),
      delete: (key) => ipcRenderer.invoke('store:delete', key)
    },
    // Sound file handling
    getSoundPath: (soundFile) => {
      return `app://${soundFile}`;
    },
    // Custom sound file operations
    sound: {
      import: (filePath) => ipcRenderer.invoke('sound:import', filePath),
      listCustom: () => ipcRenderer.invoke('sound:list-custom')
    },
    // Dialog for selecting files
    showOpenDialog: async (options) => {
      return await ipcRenderer.invoke('dialog:showOpenDialog', options);
    }
  }
); 
 