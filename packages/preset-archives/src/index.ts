import { createArchiveAdapterManifest } from '@previewdock/adapter-archive/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import type { ArchiveRuntimeOptions } from '@previewdock/adapter-archive'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface ArchivesPresetOptions { archive?: ArchiveRuntimeOptions }
export function createArchivesPack(options: ArchivesPresetOptions = {}): AdapterPack {
  return defineAdapterPack({
    id: 'archives',
    label: 'Archives',
    adapters: [createArchiveAdapterManifest(options.archive), createInspectorAdapterManifest('archives')],
  })
}
export const archivesPack = createArchivesPack()
export function createArchivesEngine(options: ArchivesPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createArchivesPack(options)])
}
