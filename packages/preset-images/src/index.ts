import { advancedImageAdapterManifest } from '@previewdock/adapter-advanced-image/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const imagesPack: AdapterPack = defineAdapterPack({
  id: 'images',
  label: 'Images',
  adapters: [imageAdapterManifest, advancedImageAdapterManifest],
})
export function createImagesEngine(): ViewerEngine { return createViewerEngine([imagesPack]) }
