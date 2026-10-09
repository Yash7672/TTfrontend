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
  },
})
