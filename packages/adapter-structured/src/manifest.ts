import type { AdapterRegistration } from '@previewdock/core'

export const structuredAdapterManifest: AdapterRegistration = {
  id: 'structured',
  priority: 25,
  extensions: [
    'bpmn', 'xmind', 'eml', 'epub', 'rtf',
    'odt', 'ods', 'ots', 'odp', 'otp', 'ott', 'fodt', 'fods',
    'ofd', 'vsdx',
  ],
  mimeTypes: [
    'application/epub+zip', 'message/rfc822', 'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.visio',
  ],
  load: async () => (await import('./index')).structuredAdapter,
}
