import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Portal de entrada (Landing)
// Puerto fijo: 3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
})