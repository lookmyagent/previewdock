import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@universal-file-viewer/core'

const audioExtensions = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus'])
const videoExtensions = new Set(['mp4', 'webm', 'ogv', 'mov', 'm4v'])
const audioMimeTypes = new Set([
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg',
  'audio/mp4', 'audio/aac', 'audio/flac', 'audio/opus',
])
const videoMimeTypes = new Set([
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
])

function mediaKind(file: FileDescriptor): 'audio' | 'video' | undefined {
  if (audioMimeTypes.has(file.mimeType) || audioExtensions.has(file.extension)) return 'audio'
  if (videoMimeTypes.has(file.mimeType) || videoExtensions.has(file.extension)) return 'video'
  return undefined
}

export const mediaAdapter: PreviewAdapter = {
  id: 'media',
  label: 'Browser media player',
  supports: file => Boolean(mediaKind(file)),
  async open(file): Promise<PreviewSession> {
    const kind = mediaKind(file)
    if (!kind) throw new Error('Unsupported media format')
    const objectUrl = URL.createObjectURL(file.blob)
    let media: HTMLMediaElement | undefined

    return {
      adapterId: 'media',
      adapterLabel: 'Browser media player',
      capabilities: ['preview', 'playback'],
      mount(container, signal) {
        if (signal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        media = document.createElement(kind)
        media.className = `ufv-media-preview ufv-media-preview--${kind}`
        media.controls = true
        media.preload = 'metadata'
        media.src = objectUrl
        if (media instanceof HTMLVideoElement) {
          media.playsInline = true
        }
        container.replaceChildren(media)
      },
      dispose() {
        if (media) {
          media.pause()
          media.removeAttribute('src')
          media.load()
          media.remove()
        }
        media = undefined
        URL.revokeObjectURL(objectUrl)
      },
    }
  },
}

export const mediaAdapterManifest = {
  id: 'media',
  extensions: [...audioExtensions, ...videoExtensions],
  mimeTypes: [...audioMimeTypes, ...videoMimeTypes],
  load: async () => mediaAdapter,
}
