import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const textDataPack: AdapterPack = defineAdapterPack({
  id: 'text-data',
  label: 'Text and data',
  adapters: [textAdapterManifest],
})

export function createTextDataEngine(): ViewerEngine {
  return createViewerEngine([textDataPack])
}
