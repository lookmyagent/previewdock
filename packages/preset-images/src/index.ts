import { advancedImageAdapterManifest } from '@previewdock/adapter-advanced-image/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const imagesPack: AdapterPack = defineAdapterPack({
  id: 'images',
  label: 'Images',
  adapters: [imageAdapterManifest, advancedImageAdapterManifest, createInspectorAdapterManifest('images')],
})
export function createImagesEngine(): ViewerEngine { return createViewerEngine([imagesPack]) }
