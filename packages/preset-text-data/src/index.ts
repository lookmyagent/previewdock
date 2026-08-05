import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const textDataPack: AdapterPack = defineAdapterPack({
  id: 'text-data',
  label: 'Text and data',
  adapters: [textAdapterManifest, createInspectorAdapterManifest('text-data')],
})

export function createTextDataEngine(): ViewerEngine {
  return createViewerEngine([textDataPack])
}
