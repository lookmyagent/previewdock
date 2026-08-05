import type { AdapterRegistration } from '@previewdock/core'

export const textAdapterManifest: AdapterRegistration = {
  id: 'text',
  extensions: [
    'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'log',
    'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html', 'htm',
    'java', 'php', 'py', 'c', 'cpp', 'cc', 'h', 'hpp', 'cs', 'sql', 'sh', 'bash',
    'vue', 'react', 'yaml', 'yml', 'ini', 'toml', 'proto', 'hcl', 'tex', 'gv',
    'http', 'go', 'rs', 'rb', 'swift', 'kt', 'diff', 'patch', 'jsonc', 'json5',
    'ipynb', 'properties', 'cfg', 'conf',
  ],
  mimeTypes: ['text/*', 'application/json', 'application/xml'],
  load: async () => (await import('./index')).textAdapter,
}
