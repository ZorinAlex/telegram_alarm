# Telegram Message Monitor

A Vue.js application that monitors Telegram messages and filters them based on keywords. Built using GramJS and Vue 3.

## Features

- Login to Telegram with phone number authentication
- 2FA support
- Session persistence using localStorage
- Real-time message monitoring
- Keyword filtering
- Modern and responsive UI
- Add/remove keywords dynamically

## Prerequisites

Before you begin, you'll need:

1. Node.js installed on your system
2. A Telegram account
3. Telegram API credentials (API ID and API Hash)

## Getting Started

1. Clone this repository:
```bash
git clone <repository-url>
cd telegram-client
```

2. Install dependencies:
```bash
npm install
```

3. Update the API credentials:
Open `src/services/TelegramService.ts` and replace the following values with your own:
```typescript
private apiId = YOUR_API_ID; // Get from https://my.telegram.org
private apiHash = 'YOUR_API_HASH';
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Enter your phone number (with country code) in the login form
2. Enter the verification code sent to your Telegram account
3. If you have 2FA enabled, enter your password
4. Once logged in, you'll see the message monitor interface
5. Add or remove keywords using the keywords section
6. Messages containing your keywords will be highlighted
7. Your session will be saved in the browser, so you won't need to log in again

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Notes

- Never share your API credentials or session string
- The session is stored in localStorage for convenience, but be aware of the security implications
- Always use HTTPS in production

## License

MIT

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
