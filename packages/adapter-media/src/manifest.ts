import type { AdapterRegistration } from '@previewdock/core'

export const mediaAdapterManifest: AdapterRegistration = {
  id: 'media',
  extensions: [
    'mp3', 'mpeg', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba',
    'mid', 'midi', 'mp4', 'webm', 'ogv', 'mov', 'm4v', 'm3u8',
  ],
  mimeTypes: [
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg',
    'audio/mp4', 'audio/aac', 'audio/flac', 'audio/opus',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  ],
  load: async () => (await import('./index')).mediaAdapter,
}
