import { createThreeDCadPack, type ThreeDCadPresetOptions } from '@previewdock/preset-3d-cad'
import { createArchivesPack, type ArchivesPresetOptions } from '@previewdock/preset-archives'
import { createDiagramsPack, type DiagramsPresetOptions } from '@previewdock/preset-diagrams'
import { createDocumentsPack, type DocumentsPresetOptions } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'
import { mediaPack } from '@previewdock/preset-media'
import { textDataPack } from '@previewdock/preset-text-data'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface AllFormatPresetOptions {
  archive?: ArchivesPresetOptions['archive']
  model?: ThreeDCadPresetOptions['model']
  legacyOffice?: DocumentsPresetOptions['legacyOffice'] & DiagramsPresetOptions['legacyOffice']
}

/** Creates one pack containing all seven official capability categories. */
export function createAllFormatPack(options: AllFormatPresetOptions = {}): AdapterPack {
  const categoryPacks = [
    createDocumentsPack({ legacyOffice: options.legacyOffice }),
    textDataPack,
    createArchivesPack({ archive: options.archive }),
    imagesPack,
    mediaPack,
    createDiagramsPack({ legacyOffice: options.legacyOffice }),
    createThreeDCadPack({ model: options.model }),
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
