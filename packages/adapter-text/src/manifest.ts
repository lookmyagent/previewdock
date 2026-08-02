import type { AdapterRegistration } from '@previewdock/core'

export const textAdapterManifest: AdapterRegistration = {
  id: 'text',
  extensions: [
    'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'log',
    'js', 'ts', 'css', 'html', 'java', 'php', 'py', 'sql', 'sh',
  ],
  mimeTypes: ['text/*', 'application/json', 'application/xml'],
  load: async () => (await import('./index')).textAdapter,
}
