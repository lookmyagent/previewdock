import { copyPreviewDockAssets } from '@previewdock/assets'
import type { Plugin } from 'vite'
import { resolve } from 'node:path'

export interface PreviewDockAssetsOptions {
  directory?: string
}

export function previewDockAssets(options: PreviewDockAssetsOptions = {}): Plugin {
  let root = process.cwd()
  let publicDir = 'public'
  return {
    name: 'previewdock-assets',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
      publicDir = typeof config.publicDir === 'string' ? config.publicDir : 'public'
    },
    async buildStart() {
      const target = resolve(root, publicDir, options.directory || 'previewdock')
      await copyPreviewDockAssets(target)
    },
  }
}

export default previewDockAssets
