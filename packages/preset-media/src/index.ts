import { mediaAdapterManifest } from '@previewdock/adapter-media/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const mediaPack: AdapterPack = defineAdapterPack({
  id: 'media',
  label: 'Media',
  adapters: [mediaAdapterManifest, createInspectorAdapterManifest('media')],
})
export function createMediaEngine(): ViewerEngine { return createViewerEngine([mediaPack]) }
