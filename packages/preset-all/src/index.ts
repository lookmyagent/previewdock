import { createThreeDCadPack, type ThreeDCadPresetOptions } from '@previewdock/preset-3d-cad'
import { createArchivesPack, type ArchivesPresetOptions } from '@previewdock/preset-archives'
import { createDiagramsPack, type DiagramsPresetOptions } from '@previewdock/preset-diagrams'
import { createDocumentsPack, type DocumentsPresetOptions } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'
import { mediaPack } from '@previewdock/preset-media'
import { textDataPack } from '@previewdock/preset-text-data'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface AllFormatPresetOptions {
  /**
   * Base URL containing PreviewDock's self-hosted runtime assets. Adapter-level
   * URLs still take precedence.
   */
  assetBaseUrl?: string
  archive?: ArchivesPresetOptions['archive']
  model?: ThreeDCadPresetOptions['model']
  legacyOffice?: DocumentsPresetOptions['legacyOffice'] & DiagramsPresetOptions['legacyOffice']
}

function assetUrl(baseUrl: string | undefined, path: string): string | undefined {
  if (!baseUrl) return undefined
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return new URL(path, new URL(normalized, globalThis.location?.href || 'http://localhost/')).toString()
}

/** Creates one pack containing all seven official capability categories. */
export function createAllFormatPack(options: AllFormatPresetOptions = {}): AdapterPack {
  const archive = {
    workerUrl: assetUrl(options.assetBaseUrl, 'libarchive/worker-bundle.js'),
    wasmUrl: assetUrl(options.assetBaseUrl, 'libarchive/libarchive.wasm'),
    ...options.archive,
  }
  const model = {
    occtWasmUrl: assetUrl(options.assetBaseUrl, 'occt/occt-import-js.wasm'),
    rhinoLibraryPath: assetUrl(options.assetBaseUrl, 'rhino/'),
    ifcWasmPath: assetUrl(options.assetBaseUrl, 'ifc/'),
    ...options.model,
  }
  const categoryPacks = [
    createDocumentsPack({ legacyOffice: options.legacyOffice }),
    textDataPack,
    createArchivesPack({ archive }),
    imagesPack,
    mediaPack,
    createDiagramsPack({ legacyOffice: options.legacyOffice }),
    createThreeDCadPack({ model }),
  ]

  return defineAdapterPack({
    id: 'all-formats',
    label: 'Official all-format preset',
    adapters: categoryPacks.flatMap(pack => pack.adapters),
  })
}

export const allFormatPack = createAllFormatPack()
export function createAllFormatEngine(options: AllFormatPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createAllFormatPack(options)])
}
