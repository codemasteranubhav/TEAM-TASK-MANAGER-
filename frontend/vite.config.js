import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  preview: {
    allowedHosts: ['happy-intuition-production-e998.up.railway.app'],
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://team-task-manager-production-2d00.up.railway.app',
        changeOrigin: true,
      }
    }
  }
})