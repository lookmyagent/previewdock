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
      '@universal-file-viewer/core': resolve(import.meta.dirname, '../../packages/core/src/index.ts'),
      '@universal-file-viewer/vue': resolve(import.meta.dirname, '../../packages/vue/src/index.ts'),
      '@universal-file-viewer/adapter-text/manifest': resolve(import.meta.dirname, '../../packages/adapter-text/src/manifest.ts'),
      '@universal-file-viewer/adapter-image/manifest': resolve(import.meta.dirname, '../../packages/adapter-image/src/manifest.ts'),
      '@universal-file-viewer/adapter-pdf/manifest': resolve(import.meta.dirname, '../../packages/adapter-pdf/src/manifest.ts'),
      '@universal-file-viewer/adapter-media/manifest': resolve(import.meta.dirname, '../../packages/adapter-media/src/manifest.ts'),
      '@universal-file-viewer/adapter-archive/manifest': resolve(import.meta.dirname, '../../packages/adapter-archive/src/manifest.ts'),
      '@universal-file-viewer/adapter-openxml/manifest': resolve(import.meta.dirname, '../../packages/adapter-openxml/src/manifest.ts'),
      '@universal-file-viewer/adapter-3d/manifest': resolve(import.meta.dirname, '../../packages/adapter-3d/src/manifest.ts'),
      '@universal-file-viewer/adapter-advanced-image/manifest': resolve(import.meta.dirname, '../../packages/adapter-advanced-image/src/manifest.ts'),
      '@universal-file-viewer/adapter-legacy-office/manifest': resolve(import.meta.dirname, '../../packages/adapter-legacy-office/src/manifest.ts'),
      '@universal-file-viewer/adapter-text': resolve(import.meta.dirname, '../../packages/adapter-text/src/index.ts'),
      '@universal-file-viewer/adapter-image': resolve(import.meta.dirname, '../../packages/adapter-image/src/index.ts'),
      '@universal-file-viewer/adapter-pdf': resolve(import.meta.dirname, '../../packages/adapter-pdf/src/index.ts'),
      '@universal-file-viewer/adapter-media': resolve(import.meta.dirname, '../../packages/adapter-media/src/index.ts'),
      '@universal-file-viewer/adapter-archive': resolve(import.meta.dirname, '../../packages/adapter-archive/src/index.ts'),
      '@universal-file-viewer/adapter-openxml': resolve(import.meta.dirname, '../../packages/adapter-openxml/src/index.ts'),
      '@universal-file-viewer/converter-zetaoffice': resolve(import.meta.dirname, '../../packages/converter-zetaoffice/src/index.ts'),
    },
  },
})
