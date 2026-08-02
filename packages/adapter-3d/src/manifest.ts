import type { AdapterRegistration } from '@universal-file-viewer/core'

export const modelAdapterManifest: AdapterRegistration = {
  id: 'model-3d',
  priority: 20,
  extensions: ['gltf', 'glb', 'obj', 'stl', 'ply', 'fbx', 'dae', '3ds', '3mf', 'wrl'],
  mimeTypes: ['model/gltf+json', 'model/gltf-binary', 'model/obj', 'model/stl'],
  load: async () => (await import('./index')).modelAdapter,
}
