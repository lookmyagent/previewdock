import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// These aliases let this repository's demo consume package source directly.
// An application using packages published to npm does not need them.
export default defineConfig({
  plugins: [vue()],
  // Demo-only: reuses the maintained Worker/WASM/font files from Playground.
  // A consuming application should deploy the same assets under its own public path.
  publicDir: resolve(import.meta.dirname, '../playground/public'),
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
  resolve: {
    alias: {
      '@previewdock/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
      '@previewdock/vue': resolve(import.meta.dirname, '../../packages/vue/src/index.ts'),
      '@previewdock/preset-all': resolve(import.meta.dirname, '../../packages/preset-all/src/index.ts'),
    },
  },
})
