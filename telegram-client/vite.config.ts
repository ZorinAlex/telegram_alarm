import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: './', // Add this to ensure assets are loaded correctly in production
    define: {
      // Pass environment variables to the client-side code
      'process.env.VITE_TELEGRAM_API_ID': JSON.stringify(env.VITE_TELEGRAM_API_ID),
      'process.env.VITE_TELEGRAM_API_HASH': JSON.stringify(env.VITE_TELEGRAM_API_HASH),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    plugins: [
      vue(),
      nodePolyfills({
        include: ['buffer', 'crypto', 'util', 'events', 'process', 'stream', 'os'],
        globals: {
          Buffer: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      // Make sure CSS is extracted and included
      cssCodeSplit: true,
      sourcemap: true,
      // Log more verbose build information
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000
    }
  }
})
