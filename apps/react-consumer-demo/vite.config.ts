import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { previewDockAssets } from '@previewdock/vite-plugin'

export default defineConfig({
  plugins: [react(), previewDockAssets()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
