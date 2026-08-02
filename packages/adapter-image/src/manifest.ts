import type { AdapterRegistration } from '@universal-file-viewer/core'

export const imageAdapterManifest: AdapterRegistration = {
  id: 'image',
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'jfif', 'svg'],
  mimeTypes: [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp',
    'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml',
  ],
  load: async () => (await import('./index')).imageAdapter,
}
