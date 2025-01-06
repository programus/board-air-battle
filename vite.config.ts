import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'Board Air Battle',
        short_name: 'Air Battle',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/images/2d/icon.svg',
            purpose: 'any maskable',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ],
      }
    }),
  ],
})
