// Global type definitions
import type { Router } from 'vue-router';

// API interface for Electron's contexBridge
declare global {
  interface Window {
    router: Router;
    api?: {
      getSoundPath?: (soundFile: string) => string;
      sound?: {
        import: (filePath: string) => Promise<any>;
        listCustom: () => Promise<any>;
      };
      showOpenDialog?: (options: any) => Promise<any>;
    }
  }
}

// Export to make TypeScript happy (this is a module)
export {}; 