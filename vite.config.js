import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend (../backend, port 3000) is proxied in dev so the site can call
// /api/... and load /uploads/... without CORS or hardcoded hosts.
const API_TARGET = process.env.VITE_API_PROXY || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': API_TARGET,
      '/uploads': API_TARGET,
    },
  },
})
