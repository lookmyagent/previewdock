import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
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
      '@previewdock/adapter-text/manifest': resolve(import.meta.dirname, '../../packages/adapter-text/src/manifest.ts'),
      '@previewdock/adapter-image/manifest': resolve(import.meta.dirname, '../../packages/adapter-image/src/manifest.ts'),
      '@previewdock/adapter-pdf/manifest': resolve(import.meta.dirname, '../../packages/adapter-pdf/src/manifest.ts'),
      '@previewdock/adapter-media/manifest': resolve(import.meta.dirname, '../../packages/adapter-media/src/manifest.ts'),
      '@previewdock/adapter-archive/manifest': resolve(import.meta.dirname, '../../packages/adapter-archive/src/manifest.ts'),
      '@previewdock/adapter-openxml/manifest': resolve(import.meta.dirname, '../../packages/adapter-openxml/src/manifest.ts'),
      '@previewdock/adapter-3d/manifest': resolve(import.meta.dirname, '../../packages/adapter-3d/src/manifest.ts'),
      '@previewdock/adapter-advanced-image/manifest': resolve(import.meta.dirname, '../../packages/adapter-advanced-image/src/manifest.ts'),
      '@previewdock/adapter-legacy-office/manifest': resolve(import.meta.dirname, '../../packages/adapter-legacy-office/src/manifest.ts'),
      '@previewdock/adapter-text': resolve(import.meta.dirname, '../../packages/adapter-text/src/index.ts'),
      '@previewdock/adapter-image': resolve(import.meta.dirname, '../../packages/adapter-image/src/index.ts'),
      '@previewdock/adapter-pdf': resolve(import.meta.dirname, '../../packages/adapter-pdf/src/index.ts'),
      '@previewdock/adapter-media': resolve(import.meta.dirname, '../../packages/adapter-media/src/index.ts'),
      '@previewdock/adapter-archive': resolve(import.meta.dirname, '../../packages/adapter-archive/src/index.ts'),
      '@previewdock/adapter-openxml': resolve(import.meta.dirname, '../../packages/adapter-openxml/src/index.ts'),
      '@previewdock/converter-zetaoffice': resolve(import.meta.dirname, '../../packages/converter-zetaoffice/src/index.ts'),
    },
  },
})
