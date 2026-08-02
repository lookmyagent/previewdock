import { enrichDetection } from './detect'
import { AdapterRegistry } from './registry'
import { createFileDescriptor } from './source'
import type {
  FileSource,
  OpenFileOptions,
  OpenResult,
  PreviewSession,
  StatusListener,
  ViewerStatus,
} from './types'

export class ViewerEngine {
  private controller?: AbortController
  private currentSession?: PreviewSession
  private readonly listeners = new Set<StatusListener>()

  constructor(readonly registry: AdapterRegistry) {}

  onStatus(listener: StatusListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(status: ViewerStatus): void {
    for (const listener of this.listeners) {
      listener(status)
    }
  }

  async open(source: FileSource, options: OpenFileOptions = {}): Promise<OpenResult> {
    await this.close()
    this.controller = new AbortController()
    const signal = this.controller.signal

    try {
      this.emit({ phase: 'loading-source', message: 'Loading file source' })
      const loaded = await createFileDescriptor(source, options, signal)

      this.emit({ phase: 'detecting', message: 'Detecting file format' })
      const descriptor = enrichDetection(loaded)

      this.emit({ phase: 'loading-adapter', message: 'Loading preview adapter' })
      const adapter = await this.registry.resolve(descriptor)
      if (!adapter) {
        throw new Error(
          `No preview adapter is registered for .${descriptor.extension || 'unknown'} (${descriptor.mimeType})`,
        )
      }

      this.emit({
        phase: 'opening',
        message: `Opening with ${adapter.label}`,
        adapterId: adapter.id,
      })
      const session = await adapter.open(descriptor, signal)
      if (signal.aborted) {
        await session.dispose()
        throw new DOMException('Preview was cancelled', 'AbortError')
      }
      this.currentSession = session
      this.emit({
        phase: 'ready',
        message: 'Preview ready',
        adapterId: adapter.id,
      })
      return { descriptor, session, signal }
    } catch (error) {
      if (!signal.aborted) {
        this.emit({
          phase: 'error',
          message: error instanceof Error ? error.message : String(error),
        })
      }
      throw error
    }
  }

  async close(): Promise<void> {
    this.controller?.abort()
    this.controller = undefined
    const session = this.currentSession
    this.currentSession = undefined
    if (session) {
      await session.dispose()
    }
    this.emit({ phase: 'idle', message: 'Idle' })
  }
}
