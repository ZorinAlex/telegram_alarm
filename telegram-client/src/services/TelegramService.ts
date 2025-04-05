import '../polyfills';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import type { NewMessageEvent } from 'telegram/events';
import type { Api } from 'telegram/tl';

// Get API credentials from environment variables
const TELEGRAM_API_ID = parseInt(import.meta.env.VITE_TELEGRAM_API_ID || '0', 10);
const TELEGRAM_API_HASH = import.meta.env.VITE_TELEGRAM_API_HASH || '';

if (!TELEGRAM_API_ID || !TELEGRAM_API_HASH) {
    console.error('Telegram API credentials not found in environment variables.');
    console.error('Please create a .env file with VITE_TELEGRAM_API_ID and VITE_TELEGRAM_API_HASH');
}

export class TelegramService {
    private static instance: TelegramService;
    private client: TelegramClient | null = null;
    private session: StringSession | null = null;
    private apiId = TELEGRAM_API_ID;
    private apiHash = TELEGRAM_API_HASH;
    private verificationCode: string = '';
    private currentPassword: string | null = null;
    private messageHandlers: ((message: any) => void)[] = [];
    private eventHandler: any = null;

    private constructor() {
        // Validate API credentials
        if (!this.apiId || !this.apiHash) {
            throw new Error('Telegram API credentials are required. Please check your .env file.');
        }
    }

    public static getInstance(): TelegramService {
        if (!TelegramService.instance) {
            TelegramService.instance = new TelegramService();
        }
        return TelegramService.instance;
    }

    public async initializeClient(): Promise<void> {
        try {
            console.log('Checking polyfills...');
            // Ensure polyfills are loaded
            if (!window.Buffer || !window.process || !window.util || !window.os) {
                console.error('Missing polyfills:', {
                    Buffer: !!window.Buffer,
                    process: !!window.process,
                    util: !!window.util,
                    os: !!window.os
                });
                throw new Error('Required polyfills are not loaded');
            }

            if (this.client?.connected) {
                console.log('Client already connected');
                return; // Client already initialized and connected
            }

            console.log('Initializing session...');
            // Initialize session
            const savedSession = localStorage.getItem('telegramSession') || '';
            this.session = new StringSession(savedSession);

            console.log('Creating new TelegramClient...');
            // Initialize client with proper connection parameters
            this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
                connectionRetries: 5,
                useWSS: true
            });

            console.log('Connecting to Telegram...');
            // Test connection
            await this.client.connect();
            console.log('Client connected successfully');
            
            if (!this.client.connected) {
                throw new Error('Failed to connect to Telegram');
            }
        } catch (error) {
            console.error('Error initializing Telegram client:', error);
            this.client = null;
            this.session = null;
            throw error;
        }
    }

    private async waitForCode(): Promise<string> {
        return new Promise<string>((resolve) => {
            const codePromise = new CustomEvent('requestCode', {
                detail: { 
                    resolve: (code: string) => {
                        this.verificationCode = code;
                        resolve(code);
                    }
                }
            });
            window.dispatchEvent(codePromise);
        });
    }

    public setPassword(password: string): void {
        this.currentPassword = password;
    }

    public async login(phoneNumber: string): Promise<void> {
        if (!this.client) {
            console.error('Client not initialized before login attempt');
            throw new Error('Client not initialized. Please call initializeClient first.');
        }

        try {
            const isAuthorized = await this.client.isUserAuthorized();
            console.log('User authorization status:', isAuthorized);

            if (!isAuthorized) {
                // Only start login process if phone number is provided (not session login)
                if (phoneNumber) {
                    console.log('Starting login process with phone:', phoneNumber);

                    await this.client.start({
                        phoneNumber: () => {
                            console.log('Providing phone number to client');
                            return Promise.resolve(phoneNumber);
                        },
                        phoneCode: async () => {
                            console.log('Requesting verification code from user...');
                            const code = await this.waitForCode();
                            console.log('Received verification code from user');
                            return code;
                        },
                        password: () => {
                            console.log('Password requested by client');
                            if (!this.currentPassword) {
                                throw new Error('PASSWORD_REQUIRED');
                            }
                            const password = this.currentPassword;
                            this.currentPassword = null; // Clear password after use
                            return Promise.resolve(password);
                        },
                        onError: (err) => {
                            console.error('Login process error:', err);
                            this.currentPassword = null; // Clear password on error
                            if (err.message?.includes('PASSWORD_HASH_INVALID')) {
                                throw new Error('PASSWORD_REQUIRED');
                            }
                            throw err;
                        },
                    });

                    // Save session string only after successful login
                    if (this.session) {
                        const sessionString = this.session.save();
                        console.log('Saving session to localStorage');
                        localStorage.setItem('telegramSession', sessionString);
                    }
                } else {
                    // Session login failed
                    throw new Error('Session expired or invalid');
                }
            } else {
                console.log('User already authorized');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.currentPassword = null; // Clear password on error
            throw error;
        }
    }

    public async startMessageListener(keywords: string[], onMessage: (data: any) => void): Promise<void> {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        const { NewMessage } = await import('telegram/events');

        this.client.addEventHandler(async (event: NewMessageEvent) => {
            const message = event.message.message;
            const sender = await event.message.getSender() as Api.User;
            const chat = await event.message.getChat() as Api.Chat;

            const messageData = {
                text: message,
                sender: (sender as any)?.username || (sender as any)?.first_name || 'Unknown',
                chat: (chat as any)?.title || 'Unknown Chat',
                timestamp: new Date(),
                matchedKeywords: keywords.filter(keyword => 
                    message.toLowerCase().includes(keyword.toLowerCase())
                )
            };

            onMessage(messageData);
        }, new NewMessage({}));
    }

    public isLoggedIn(): boolean {
        return !!localStorage.getItem('telegramSession');
    }

    public async logout(): Promise<void> {
        try {
            await this.disconnect();
            localStorage.removeItem('telegramSession');
            this.client = null;
            this.session = null;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    public onMessage(handler: (message: any) => void): void {
        this.messageHandlers.push(handler);
    }

    private notifyMessageHandlers(message: any): void {
        this.messageHandlers.forEach(handler => handler(message));
    }

    public async startMessageMonitoring(): Promise<void> {
        if (!this.client) {
            throw new Error('Client not initialized');
        }

        try {
            // Remove existing event handler if any
            if (this.eventHandler) {
                this.client.removeEventHandler(this.eventHandler, new NewMessage({}));
                this.eventHandler = null;
            }

            await this.client.getDialogs({}); // Ensure connection is active

            // Create new event handler
            this.eventHandler = async (event: NewMessageEvent) => {
                try {
                    console.log('Raw event received:', event);
                    
                    const message = event.message;
                    if (message) {
                        console.log('Processing message:', message);

                        // Get sender and chat info
                        const sender = await message.getSender() as Api.User;
                        const chat = await message.getChat() as Api.Chat;
                        console.log('Sender and chat info:', { sender, chat });

                        const processedMessage = {
                            id: message.id,
                            text: message.message,
                            sender: (sender as any)?.username || (sender as any)?.first_name || 'Unknown',
                            chat: (chat as any)?.title || 'Unknown Chat',
                            date: message.date
                        };

                        console.log('Processed message:', processedMessage);
                        this.notifyMessageHandlers(processedMessage);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };

            // Add the event handler with proper event builder
            this.client.addEventHandler(this.eventHandler, new NewMessage({}));
            console.log('Message monitoring started successfully');
        } catch (error) {
            console.error('Error starting message monitoring:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            try {
                // Remove event handler
                if (this.eventHandler) {
                    this.client.removeEventHandler(this.eventHandler, new NewMessage({}));
                    this.eventHandler = null;
                }
                await this.client.disconnect();
            } catch (error) {
                console.error('Error during disconnect:', error);
            }
        }
    }
} 