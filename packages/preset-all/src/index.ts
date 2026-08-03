import { createModelAdapterManifest } from '@previewdock/adapter-3d/manifest'
import type { ModelAdapterOptions } from '@previewdock/adapter-3d'
import { advancedImageAdapterManifest } from '@previewdock/adapter-advanced-image/manifest'
import { createArchiveAdapterManifest } from '@previewdock/adapter-archive/manifest'
import type { ArchiveRuntimeOptions } from '@previewdock/adapter-archive'
import { imageAdapterManifest } from '@previewdock/adapter-image/manifest'
import { createLegacyOfficeAdapterManifest } from '@previewdock/adapter-legacy-office/manifest'
import type { LegacyOfficeAdapterOptions } from '@previewdock/adapter-legacy-office'
import { mediaAdapterManifest } from '@previewdock/adapter-media/manifest'
import { openXmlAdapterManifest } from '@previewdock/adapter-openxml/manifest'
import { pdfAdapterManifest } from '@previewdock/adapter-pdf/manifest'
import { structuredAdapterManifest } from '@previewdock/adapter-structured/manifest'
import { textAdapterManifest } from '@previewdock/adapter-text/manifest'
import {
  createViewerEngine,
  defineAdapterPack,
  type AdapterPack,
  type ViewerEngine,
} from '@previewdock/core'

export interface AllFormatPresetOptions {
  /** Worker/WASM URLs and nested-entry behavior for archive formats. */
  archive?: ArchiveRuntimeOptions
  /** WASM/library locations used by CAD, IFC, and Rhino formats. */
  model?: ModelAdapterOptions
  /** Optional DOC/PPT converter and legacy Office runtime configuration. */
  legacyOffice?: LegacyOfficeAdapterOptions
}

/**
 * Creates the official full PreviewDock capability pack.
 *
 * Only lightweight manifests are registered immediately. Each renderer and its
 * heavyweight dependencies remain behind the adapter's dynamic import and load
 * only after a matching file is opened.
 */
export function createAllFormatPack(options: AllFormatPresetOptions = {}): AdapterPack {
  return defineAdapterPack({
    id: 'all-formats',
    label: 'Official all-format preset',
    adapters: [
      textAdapterManifest,
      imageAdapterManifest,
      pdfAdapterManifest,
      mediaAdapterManifest,
      advancedImageAdapterManifest,
      createArchiveAdapterManifest(options.archive),
      openXmlAdapterManifest,
      createLegacyOfficeAdapterManifest(options.legacyOffice),
      structuredAdapterManifest,
      createModelAdapterManifest(options.model),
    ],
  })
}

/** Default zero-configuration pack for browser-native formats. */
export const allFormatPack = createAllFormatPack()

/** Creates a ready-to-use engine backed by the official all-format preset. */
export function createAllFormatEngine(options: AllFormatPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createAllFormatPack(options)])
}
