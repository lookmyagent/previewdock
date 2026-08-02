import type { AdapterRegistration } from '@previewdock/core'

export const pdfAdapterManifest: AdapterRegistration = {
  id: 'pdf',
  extensions: ['pdf'],
  mimeTypes: ['application/pdf'],
  load: async () => (await import('./index')).pdfAdapter,
}
