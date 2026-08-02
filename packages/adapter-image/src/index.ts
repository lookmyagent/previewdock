import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@universal-file-viewer/core'

const extensions = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'jfif', 'svg',
])
const mimeTypes = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'image/bmp', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml',
])

function isImageFile(file: FileDescriptor): boolean {
  return mimeTypes.has(file.mimeType) || extensions.has(file.extension)
}

export const imageAdapter: PreviewAdapter = {
  id: 'image',
  label: 'Browser image renderer',
  supports: isImageFile,
  async open(file): Promise<PreviewSession> {
    const objectUrl = URL.createObjectURL(file.blob)
    let image: HTMLImageElement | undefined

    return {
      adapterId: 'image',
      adapterLabel: 'Browser image renderer',
      capabilities: ['preview'],
      async mount(container, signal) {
        image = document.createElement('img')
        image.className = 'ufv-image-preview'
        image.alt = file.name

        await new Promise<void>((resolve, reject) => {
          if (!image) {
            reject(new Error('Image element is unavailable'))
            return
          }
          const handleAbort = () => reject(
            new DOMException('Preview was cancelled', 'AbortError'),
          )
          image.onload = () => {
            signal.removeEventListener('abort', handleAbort)
            resolve()
          }
          image.onerror = () => {
            signal.removeEventListener('abort', handleAbort)
            reject(new Error(`Unable to decode image ${file.name}`))
          }
          signal.addEventListener('abort', handleAbort, { once: true })
          image.src = objectUrl
          container.replaceChildren(image)
        })
      },
      dispose() {
        image?.remove()
        image = undefined
        URL.revokeObjectURL(objectUrl)
      },
    }
  },
}

export const imageAdapterManifest = {
  id: 'image',
  extensions: [...extensions],
  mimeTypes: [...mimeTypes],
  load: async () => imageAdapter,
}
