import { createLegacyDiagramAdapterManifest } from '@previewdock/adapter-legacy-office/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import type { LegacyOfficeAdapterOptions } from '@previewdock/adapter-legacy-office'
import { structuredDiagramAdapterManifest } from '@previewdock/adapter-structured/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface DiagramsPresetOptions { legacyOffice?: LegacyOfficeAdapterOptions }
export function createDiagramsPack(options: DiagramsPresetOptions = {}): AdapterPack {
  return defineAdapterPack({
    id: 'diagrams',
    label: 'Diagrams',
    adapters: [
      structuredDiagramAdapterManifest,
      createLegacyDiagramAdapterManifest(options.legacyOffice),
      createInspectorAdapterManifest('diagrams'),
    ],
  })
}
export const diagramsPack = createDiagramsPack()
export function createDiagramsEngine(options: DiagramsPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createDiagramsPack(options)])
}
