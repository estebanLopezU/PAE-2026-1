import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    assetsInclude: ['**/*.mp3']
  },
  // PostCSS embebido (equivale a postcss.config.js; evita errores de lectura con OneDrive)
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})