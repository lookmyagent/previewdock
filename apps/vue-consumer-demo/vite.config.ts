import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// These aliases let this repository's demo consume package source directly.
// An application using packages published to npm does not need them.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@previewdock/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
      '@previewdock/vue': resolve(import.meta.dirname, '../../packages/vue/src/index.ts'),
      '@previewdock/preset-all': resolve(import.meta.dirname, '../../packages/preset-all/src/index.ts'),
    },
  },
})
