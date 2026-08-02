import { describe, expect, it, vi } from 'vitest'
import { AdapterRegistry } from './registry'
import type { FileDescriptor, PreviewAdapter } from './types'

const textFile: FileDescriptor = {
  source: new Blob(['hello']),
  blob: new Blob(['hello'], { type: 'text/plain' }),
  name: 'hello.txt',
  extension: 'txt',
  mimeType: 'text/plain',
  size: 5,
  head: new Uint8Array([104, 101, 108, 108, 111]),
}

describe('AdapterRegistry', () => {
  it('loads only the matching adapter and caches it', async () => {
    const registry = new AdapterRegistry()
    const loadText = vi.fn(async (): Promise<PreviewAdapter> => ({
      id: 'text',
      label: 'Text',
      supports: () => true,
      open: vi.fn(),
    }))
    const loadImage = vi.fn(async (): Promise<PreviewAdapter> => ({
      id: 'image',
      label: 'Image',
      supports: () => true,
      open: vi.fn(),
    }))

    registry.register({
      id: 'text',
      extensions: ['txt'],
      load: loadText,
    })
    registry.register({
      id: 'image',
      extensions: ['png'],
      load: loadImage,
    })

    await registry.resolve(textFile)
    await registry.resolve(textFile)

    expect(loadText).toHaveBeenCalledTimes(1)
    expect(loadImage).not.toHaveBeenCalled()
  })
})
