import type { AdapterRegistration } from '@previewdock/core'

export const imageAdapterManifest: AdapterRegistration = {
  id: 'image',
  extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'jfif', 'svg'],
  mimeTypes: [
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/bmp',
    'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml',
  ],
  load: async () => (await import('./index')).imageAdapter,
}
