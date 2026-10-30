import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // umožňuje přístup z lokální sítě (např. otestovat z mobilu na stejné Wi-Fi)
    allowedHosts: [
      'yleventdeck.cloud',
      'www.yleventdeck.cloud',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // Při lokálním vývoji přeposílá všechny požadavky na /api na běžící FastAPI backend
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
