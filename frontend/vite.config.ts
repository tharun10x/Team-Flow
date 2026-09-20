import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[Proxy Error]', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[Proxy Request]', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[Proxy Response]', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
