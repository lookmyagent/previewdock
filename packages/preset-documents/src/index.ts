import { createLegacyOfficeDocumentAdapterManifest } from '@previewdock/adapter-legacy-office/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import type { LegacyOfficeAdapterOptions } from '@previewdock/adapter-legacy-office'
import { openXmlAdapterManifest } from '@previewdock/adapter-openxml/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'
import { structuredDocumentAdapterManifest } from '@previewdock/adapter-structured/manifest'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface DocumentsPresetOptions {
  legacyOffice?: LegacyOfficeAdapterOptions
}

export function createDocumentsPack(options: DocumentsPresetOptions = {}): AdapterPack {
  return defineAdapterPack({
    id: 'documents',
    label: 'Office and documents',
    adapters: [
      pdfAdapterManifest,
      openXmlAdapterManifest,
      createLegacyOfficeDocumentAdapterManifest(options.legacyOffice),
      structuredDocumentAdapterManifest,
      createInspectorAdapterManifest('documents'),
    ],
  })
}

export const documentsPack = createDocumentsPack()
export function createDocumentsEngine(options: DocumentsPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createDocumentsPack(options)])
}
