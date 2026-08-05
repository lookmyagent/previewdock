import type { AdapterRegistration } from '@previewdock/core'

export const advancedImageAdapterManifest: AdapterRegistration = {
  id: 'advanced-image',
  priority: 30,
  extensions: ['tif', 'tiff', 'tga', 'psd', 'heic', 'heif'],
  mimeTypes: ['image/tiff', 'image/vnd.adobe.photoshop', 'image/heic', 'image/heif'],
  load: async () => (await import('./index')).advancedImageAdapter,
}
