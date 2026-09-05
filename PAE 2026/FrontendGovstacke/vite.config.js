import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend GOVStake 360
// Puerto fijo: 3002
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true,
  },
})