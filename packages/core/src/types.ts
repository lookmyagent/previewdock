export type FileSource = Blob | ArrayBuffer | Uint8Array | string

export type PreviewCapability =
  | 'preview'
  | 'search'
  | 'select-text'
  | 'copy'
  | 'download'
  | 'print'
  | 'zoom'
  | 'rotate'
  | 'pages'
  | 'layers'
  | 'playback'

export interface FileDescriptor {
  source: FileSource
  blob: Blob
  name: string
  extension: string
  mimeType: string
  size: number
  head: Uint8Array
  /**
   * Reads an exclusive byte range without requiring the caller to materialize
   * the complete file. Remote implementations may use HTTP Range requests.
   */
  readRange(start: number, end: number, signal?: AbortSignal): Promise<Uint8Array>
  randomAccess: 'memory' | 'blob' | 'http-range'
}

export interface OpenFileOptions {
  name?: string
  mimeType?: string
}

export interface PreviewSession {
  adapterId: string
  adapterLabel: string
  capabilities: PreviewCapability[]
  mount(container: HTMLElement, signal: AbortSignal): void | Promise<void>
  dispose(): void | Promise<void>
}

export interface PreviewAdapter {
  id: string
  label: string
  supports(file: FileDescriptor): boolean
  open(file: FileDescriptor, signal: AbortSignal): Promise<PreviewSession>
}

export interface AdapterRegistration {
  id: string
  extensions?: string[]
  mimeTypes?: string[]
  priority?: number
  load(): Promise<PreviewAdapter>
}

export type ViewerPhase =
  | 'idle'
  | 'loading-source'
  | 'detecting'
  | 'loading-adapter'
  | 'opening'
  | 'ready'
  | 'error'

export interface ViewerStatus {
  phase: ViewerPhase
  message: string
  adapterId?: string
}

export interface OpenResult {
  descriptor: FileDescriptor
  session: PreviewSession
  signal: AbortSignal
}

export type StatusListener = (status: ViewerStatus) => void
