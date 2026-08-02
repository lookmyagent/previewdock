import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'universal-file-viewer',
    },
    rollupOptions: {
      external: ['vue', '@universal-file-viewer/core'],
    },
  },
})
