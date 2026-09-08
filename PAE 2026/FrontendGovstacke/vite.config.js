import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend GOVStake 360
// Puerto fijo: 3002 | Proxy API → microservicio GOVStake (8002)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
})