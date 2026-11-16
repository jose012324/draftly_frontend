import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The Django server the dev server proxies to.
 * Change it here when the backend does not run on the default port.
 */
const BACKEND_ORIGIN = 'https://draftly-backend-qv07.onrender.com';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    // In development the frontend calls "/api/..." and Vite forwards those calls
    // to the Django server, so the browser never performs a cross-origin request.
    // The WebSocket of the live updates is proxied the same way.
    proxy: {
      '/api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
      },
      '/ws': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the heavy dependencies — they change far less often than the
        // application code and can then stay in the browser cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          // @tiptap/pm is a subpath-only package — it is pulled in by the
          // entries above and cannot be listed on its own.
          tiptap: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit', '@tiptap/extensions'],
        },
      },
    },
  },
});
