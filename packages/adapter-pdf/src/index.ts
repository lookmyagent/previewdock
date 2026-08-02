import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'

function isPdf(file: FileDescriptor): boolean {
  return file.extension === 'pdf' || file.mimeType === 'application/pdf'
}

export const pdfAdapter: PreviewAdapter = {
  id: 'pdf',
  label: 'Browser PDF viewer',
  supports: isPdf,
  async open(file): Promise<PreviewSession> {
    const objectUrl = URL.createObjectURL(file.blob)
    let frame: HTMLIFrameElement | undefined

    return {
      adapterId: 'pdf',
      adapterLabel: 'Browser PDF viewer',
      capabilities: ['preview', 'pages', 'print'],
      mount(container, signal) {
        if (signal.aborted) {
          throw new DOMException('Preview was cancelled', 'AbortError')
        }
        frame = document.createElement('iframe')
        frame.className = 'ufv-pdf-preview'
        frame.title = file.name
        frame.src = objectUrl
        container.replaceChildren(frame)
      },
      dispose() {
        frame?.remove()
        frame = undefined
        URL.revokeObjectURL(objectUrl)
      },
    }
  },
}

export const pdfAdapterManifest = {
  id: 'pdf',
  extensions: ['pdf'],
  mimeTypes: ['application/pdf'],
  load: async () => pdfAdapter,
}
