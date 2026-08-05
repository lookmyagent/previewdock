import { createModelAdapterManifest } from '@previewdock/adapter-3d/manifest'
import { createInspectorAdapterManifest } from '@previewdock/adapter-inspector/manifest'
import type { ModelAdapterOptions } from '@previewdock/adapter-3d'
import { createViewerEngine, defineAdapterPack, type AdapterPack, type ViewerEngine } from '@previewdock/core'

export interface ThreeDCadPresetOptions { model?: ModelAdapterOptions }
export function createThreeDCadPack(options: ThreeDCadPresetOptions = {}): AdapterPack {
  return defineAdapterPack({
    id: '3d-cad',
    label: '3D and CAD',
    adapters: [createModelAdapterManifest(options.model), createInspectorAdapterManifest('3d-cad')],
  })
}
export const threeDCadPack = createThreeDCadPack()
export function createThreeDCadEngine(options: ThreeDCadPresetOptions = {}): ViewerEngine {
  return createViewerEngine([createThreeDCadPack(options)])
}
