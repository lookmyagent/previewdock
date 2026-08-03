import { mediaAdapterManifest } from '@previewdock/adapter-media/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export const mediaPack: AdapterPack = defineAdapterPack({ id: 'media', label: 'Media', adapters: [mediaAdapterManifest] })
export function createMediaEngine(): ViewerEngine { return createViewerEngine([mediaPack]) }
