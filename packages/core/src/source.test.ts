import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFileDescriptor } from './source'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('random-access file sources', () => {
  it('reads local Blob ranges without materializing a second complete file', async () => {
    const source = new Blob([new Uint8Array([1, 2, 3, 4, 5])], {
      type: 'application/zip',
    })
    const descriptor = await createFileDescriptor(
      source,
      { name: 'sample.zip' },
      new AbortController().signal,
    )

    expect(descriptor.randomAccess).toBe('blob')
    expect([...await descriptor.readRange(1, 4)]).toEqual([2, 3, 4])
  })

  it('keeps large remote ZIP files range-backed', async () => {
    const size = 200 * 1024 * 1024
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: {
            'accept-ranges': 'bytes',
            'content-length': String(size),
            'content-type': 'application/zip',
          },
        })
      }
      const range = new Headers(init?.headers).get('range')
      if (range === 'bytes=10-13') {
        return new Response(new Uint8Array([10, 11, 12, 13]), {
          status: 206,
          headers: { 'content-range': `bytes 10-13/${size}` },
        })
      }
      return new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
        status: 206,
        headers: { 'content-range': `bytes 0-65535/${size}` },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const descriptor = await createFileDescriptor(
      'https://files.example.com/large.zip',
      {},
      new AbortController().signal,
    )

    expect(descriptor.size).toBe(size)
    expect(descriptor.randomAccess).toBe('http-range')
    expect(descriptor.blob.size).toBe(4)
    expect([...await descriptor.readRange(10, 14)]).toEqual([10, 11, 12, 13])
  })

  it('probes Range when HEAD omits Accept-Ranges', async () => {
    const size = 200 * 1024 * 1024
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: { 'content-length': String(size), 'content-type': 'application/zip' },
        })
      }
      return new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
        status: 206,
        headers: { 'content-range': `bytes 0-65535/${size}` },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const descriptor = await createFileDescriptor(
      'https://files.example.com/probed.zip',
      {},
      new AbortController().signal,
    )

    expect(descriptor.size).toBe(size)
    expect(descriptor.randomAccess).toBe('http-range')
  })

  it('rejects large remote ZIP files when the server has no Range support', async () => {
    const fetchMock = vi.fn(async () => new Response(null, {
      status: 200,
      headers: { 'content-length': String(200 * 1024 * 1024) },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createFileDescriptor(
      'https://files.example.com/large.zip',
      {},
      new AbortController().signal,
    )).rejects.toThrow('requires HTTP Range support')
  })
})
