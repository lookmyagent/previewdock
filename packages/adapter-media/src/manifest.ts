import type { AdapterRegistration } from '@universal-file-viewer/core'

export const mediaAdapterManifest: AdapterRegistration = {
  id: 'media',
  extensions: [
    'mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus',
    'mp4', 'webm', 'ogv', 'mov', 'm4v',
  ],
  mimeTypes: [
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg',
    'audio/mp4', 'audio/aac', 'audio/flac', 'audio/opus',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  ],
  load: async () => (await import('./index')).mediaAdapter,
}
