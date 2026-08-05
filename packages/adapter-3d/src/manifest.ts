import type { AdapterRegistration } from '@previewdock/core'
import type { ModelAdapterOptions } from './index'

export function createModelAdapterManifest(options: ModelAdapterOptions = {}): AdapterRegistration {
  return {
    id: 'model-3d',
    priority: 20,
    extensions: [
      'gltf', 'glb', 'obj', 'stl', 'ply', 'fbx', 'dae', '3ds', '3mf', 'amf',
      'wrl', 'vrml', 'pcd', 'vtk', 'xyz', 'usdz', 'kmz',
      'off', 'dxf', '3dm', 'ifc', 'step', 'stp', 'iges', 'igs', 'brep',
    ],
    mimeTypes: ['model/gltf+json', 'model/gltf-binary', 'model/obj', 'model/stl'],
    load: async () => (await import('./index')).createModelAdapter(options),
  }
}

export const modelAdapterManifest = createModelAdapterManifest()
