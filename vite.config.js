import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend (../backend, port 3000) is proxied in dev so the site can call
// /api/... and load /uploads/... without CORS or hardcoded hosts.
// 127.0.0.1 (not "localhost") avoids Node resolving to IPv6 (::1) while the
// backend listens on IPv4, a common cause of ECONNRESET / ECONNREFUSED.
const API_TARGET = process.env.VITE_API_PROXY || 'http://127.0.0.1:3000'

const proxyOptions = {
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
  // Print the real reason in the Vite terminal if the backend drops a request
  configure: (proxy) => {
    proxy.on('error', (err, req) => {
      console.error(`[proxy] ${req.method} ${req.url} -> ${API_TARGET} failed: ${err.code || err.message}`)
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxyOptions,
      '/uploads': proxyOptions,
    },
  },
})