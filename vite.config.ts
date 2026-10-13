import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production Nginx serves the built files and proxies /api to the backend
// container. This proxy exists only so `npm run dev` can talk to a backend
// running locally on port 8080.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split stable third-party code into its own chunks so a normal app
        // deploy only invalidates the app/page chunks, not React or the icons.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
})
