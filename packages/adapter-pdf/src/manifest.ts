import type { AdapterRegistration } from '@universal-file-viewer/core'

export const pdfAdapterManifest: AdapterRegistration = {
  id: 'pdf',
  extensions: ['pdf'],
  mimeTypes: ['application/pdf'],
  load: async () => (await import('./index')).pdfAdapter,
}
