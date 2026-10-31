import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Serve the static landing page in public/landing/ at /landing instead of
// letting the SPA fallback hand that URL to React Router.
const landingPage = (): Plugin => {
  const rewrite: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (path === '/landing') {
      res.statusCode = 301
      res.setHeader('Location', '/landing/')
      res.end()
      return
    }
    if (path === '/landing/') req.url = '/landing/index.html'
    next()
  }
  return {
    name: 'landing-page',
    configureServer: (server) => { server.middlewares.use(rewrite) },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [landingPage(), react()],
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
