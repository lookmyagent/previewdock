import type { AdapterRegistration } from '@universal-file-viewer/core'

export const openXmlAdapterManifest: AdapterRegistration = {
  id: 'openxml',
  extensions: [
    'docx', 'docm', 'dotx', 'dotm',
    'xlsx', 'xlsm', 'xltx', 'xltm', 'xlam',
    'pptx', 'pptm', 'potx', 'potm', 'ppsx', 'ppsm',
  ],
  mimeTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  load: async () => (await import('./index')).openXmlAdapter,
}
