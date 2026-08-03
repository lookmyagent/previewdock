import type { AdapterRegistration } from '@previewdock/core'

const documentExtensions = [
  'eml', 'epub', 'rtf',
  'odt', 'ods', 'ots', 'odp', 'otp', 'ott', 'fodt', 'fods', 'ofd',
]

const documentMimeTypes = [
  'application/epub+zip', 'message/rfc822', 'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
]

const diagramExtensions = ['bpmn', 'xmind', 'vsdx']
const diagramMimeTypes = ['application/vnd.visio']

function createStructuredManifest(
  id: string,
  extensions: string[],
  mimeTypes: string[],
): AdapterRegistration {
  return {
    id,
    priority: 25,
    extensions,
    mimeTypes,
    load: async () => (await import('./index')).structuredAdapter,
  }
}

export const structuredDocumentAdapterManifest = createStructuredManifest(
  'structured-documents',
  documentExtensions,
  documentMimeTypes,
)

export const structuredDiagramAdapterManifest = createStructuredManifest(
  'structured-diagrams',
  diagramExtensions,
  diagramMimeTypes,
)

/** Backward-compatible manifest containing every structured format. */
export const structuredAdapterManifest = createStructuredManifest(
  'structured',
  [...documentExtensions, ...diagramExtensions],
  [...documentMimeTypes, ...diagramMimeTypes],
)
