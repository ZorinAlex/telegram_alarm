const { app, BrowserWindow, ipcMain, protocol, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Load environment variables in production
const isDev = process.env.NODE_ENV === 'development';
if (!isDev) {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      // Try to load dotenv if available, but don't fail if not
      try {
        require('dotenv').config({ path: envPath });
        console.log('Loaded environment variables from .env file');
      } catch (err) {
        console.log('dotenv module not available, parsing .env file manually');
        // Simple manual parsing of .env file
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n');
        for (const line of envLines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, value] = trimmedLine.split('=');
            if (key && value) {
              process.env[key.trim()] = value.trim();
            }
          }
        }
        console.log('Parsed environment variables manually');
      }
    } else {
      console.log('.env file not found in production');
    }
  } catch (err) {
    console.error('Error loading .env file:', err);
  }
}

console.log('Environment:', process.env.NODE_ENV);
console.log('API ID available:', !!process.env.VITE_TELEGRAM_API_ID);

// Telegram service
const telegramServiceModule = require('./telegram-service');
let telegramService = null;

try {
  telegramService = telegramServiceModule.getInstance();
  console.log('Telegram service loaded successfully');
} catch (error) {
  console.error('Error loading telegram service:', error);
}

// Prepare the main window
let mainWindow = null;

function createWindow() {
  console.log('Creating window in mode:', isDev ? 'development' : 'production');
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, isDev ? '../public/logo.png' : '../dist/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  });

  // Hide the menu bar
  mainWindow.setMenu(null);

  // Add keyboard shortcut to open DevTools in any mode
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Ctrl+Shift+I to open DevTools
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      console.log('DevTools shortcut detected, opening DevTools');
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
  });

  // Load the app
  if (isDev) {
    console.log('Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server URL
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the dist directory
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production file from:', indexPath);
    console.log('File exists:', require('fs').existsSync(indexPath));
    console.log('Directory contents:', require('fs').readdirSync(path.join(__dirname, '../dist')));
    
    mainWindow.loadFile(indexPath).catch(e => {
      console.error('Failed to load app:', e);
    });

    // Remove automatic DevTools opening in production
    // mainWindow.webContents.openDevTools();

    // Remove debug overlay injection
    mainWindow.webContents.on('did-finish-load', () => {
      // Force router navigation if login state is true
      mainWindow.webContents.executeJavaScript(`
        // Force router navigation if login state is true
        setTimeout(() => {
          if (window.hasOwnProperty('router')) {
            console.log('Forcing navigation to /messages route');
            window.router.push('/messages');
          } else {
            console.log('Router not available in window object');
          }
        }, 1000);
      `);
    });

    // Log any page errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Page failed to load:', errorCode, errorDescription);
    });
  }

  // Log when the window content is loaded
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window content loaded successfully');
  });

  // Log any console messages from the renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Renderer Console:', message);
  });

  // Set up IPC handlers
  ipcMain.handle('file:read', async (event, filePath) => {
    // Implement secure file reading logic here
    // Make sure to validate the file path
  });

  ipcMain.handle('store:get', async (event, key) => {
    // Implement secure storage get logic
  });

  ipcMain.handle('store:set', async (event, key, value) => {
    // Implement secure storage set logic
  });

  ipcMain.handle('store:delete', async (event, key) => {
    // Implement secure storage delete logic
  });

  // Handler for importing sound files
  ipcMain.handle('sound:import', async (event, sourcePath) => {
    try {
      console.log('Importing sound file from:', sourcePath);
      
      // Get filename from path
      const fileName = path.basename(sourcePath);
      
      // Determine target directory based on environment
      let targetDir;
      
      if (isDev) {
        // In development, save to public folder
        targetDir = path.join(__dirname, '../public');
      } else {
        // In production, save to user data directory
        targetDir = path.join(app.getPath('userData'), 'sounds');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
      }
      
      // Full path to target file
      const targetPath = path.join(targetDir, fileName);
      
      // Copy the file
      fs.copyFileSync(sourcePath, targetPath);
      
      console.log('Sound file copied to:', targetPath);
      console.log('File exists after copy:', fs.existsSync(targetPath));
      
      return { 
        success: true, 
        fileName, 
        path: targetPath 
      };
    } catch (error) {
      console.error('Error importing sound file:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  });

  // Handler for getting custom sounds
  ipcMain.handle('sound:list-custom', async (event) => {
    try {
      // Determine directory based on environment
      let soundDir;
      
      if (isDev) {
        // In development, sounds are in public folder
        soundDir = path.join(__dirname, '../public');
      } else {
        // In production, sounds are in user data directory
        soundDir = path.join(app.getPath('userData'), 'sounds');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(soundDir)) {
          fs.mkdirSync(soundDir, { recursive: true });
          console.log('Created sounds directory:', soundDir);
          return { success: true, sounds: [] };
        }
      }
      
      console.log('Looking for custom sounds in:', soundDir);
      
      // Read all files in the directory
      const files = fs.readdirSync(soundDir);
      
      // Filter for MP3 files
      const sounds = files.filter(file => file.toLowerCase().endsWith('.mp3'));
      
      console.log('Custom sounds found:', sounds);
      console.log('Full paths:');
      sounds.forEach(sound => {
        const fullPath = path.join(soundDir, sound);
        console.log(` - ${sound}: ${fullPath} (exists: ${fs.existsSync(fullPath)})`);
      });
      
      return { success: true, sounds };
    } catch (error) {
      console.error('Error listing custom sounds:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler for file open dialogs
  ipcMain.handle('dialog:showOpenDialog', async (event, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  return mainWindow;
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('App is ready');
  
  // Register protocol handler for sound files
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6); // Remove 'app://'
    try {
      // Decode the URL to handle Cyrillic and special characters
      const decodedUrl = decodeURIComponent(url);
      console.log('Decoded URL:', decodedUrl);
      
      // Handle sound files in production
      if (decodedUrl.endsWith('.mp3')) {
        let soundPath;
        if (isDev) {
          // In development, sound files are in the public directory
          soundPath = path.normalize(`${__dirname}/../public/${decodedUrl}`);
        } else {
          // In production, try multiple possible locations with the normalized filename
          
          // Try resources/sounds directory first
          soundPath = path.normalize(`${__dirname}/../resources/sounds/${decodedUrl}`);
          
          if (!fs.existsSync(soundPath)) {
            // Try other locations if the first one fails
            const possiblePaths = [
              path.normalize(`${process.resourcesPath}/${decodedUrl}`),
              path.normalize(`${process.resourcesPath}/sounds/${decodedUrl}`),
              path.normalize(`${app.getPath('userData')}/${decodedUrl}`),
              path.normalize(`${app.getPath('userData')}/sounds/${decodedUrl}`) // Add this path for custom imported sounds
            ];
            
            // Find first path that exists
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                soundPath = p;
                break;
              }
            }
          }
        }
        
        console.log('Sound file requested:', decodedUrl);
        console.log('Resolved path:', soundPath);
        console.log('File exists:', fs.existsSync(soundPath));
        
        if (fs.existsSync(soundPath)) {
          return callback({ path: soundPath });
        } else {
          console.error('Sound file not found:', soundPath);
          return callback({ error: -2 }); // File not found
        }
      }
      
      callback({ path: path.normalize(`${__dirname}/${decodedUrl}`) });
    } catch (error) {
      console.error('Protocol handler error:', error);
      callback({ error: -2 });
    }
  });
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 
 