import type { FileDescriptor, FileSource, OpenFileOptions } from './types'

const DEFAULT_NAME = 'untitled'
const HEAD_SIZE = 64 * 1024
const LARGE_REMOTE_ARCHIVE_THRESHOLD = 100 * 1024 * 1024
const MAX_REMOTE_ARCHIVE_SIZE = 1024 * 1024 * 1024
const rangeArchiveExtensions = new Set(['zip', 'jar'])

interface LoadedSource {
  blob: Blob
  size: number
  mimeType: string
  head: Uint8Array
  randomAccess: FileDescriptor['randomAccess']
  readRange(start: number, end: number, signal?: AbortSignal): Promise<Uint8Array>
}

function filenameFromUrl(value: string): string {
  try {
    const url = new URL(value, globalThis.location?.href)
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || DEFAULT_NAME)
  } catch {
    return value.split('?')[0]?.split('#')[0]?.split('/').pop() || DEFAULT_NAME
  }
}

export function extensionFromName(name: string): string {
  const cleanName = name.split('?')[0]?.split('#')[0] || name
  const extension = cleanName.includes('.') ? cleanName.split('.').pop() : ''
  return String(extension || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function sourceToBlob(source: FileSource, signal: AbortSignal): Promise<Blob> {
  if (typeof source === 'string') {
    const response = await fetch(source, { signal })
    if (!response.ok) {
      throw new Error(`Unable to load file: HTTP ${response.status}`)
    }
    return response.blob()
  }
  if (source instanceof Blob) {
    return source
  }
  if (source instanceof Uint8Array) {
    const bytes = new Uint8Array(source.byteLength)
    bytes.set(source)
    return new Blob([bytes.buffer])
  }
  return new Blob([source])
}

function parseContentLength(value: string | null): number | undefined {
  if (!value) return undefined
  const size = Number.parseInt(value, 10)
  return Number.isSafeInteger(size) && size >= 0 ? size : undefined
}

function totalFromContentRange(value: string | null): number | undefined {
  const match = value?.match(/^bytes\s+\d+-\d+\/(\d+)$/i)
  return match?.[1] ? parseContentLength(match[1]) : undefined
}

async function bytesFromResponse(response: Response): Promise<Uint8Array> {
  return new Uint8Array(await response.arrayBuffer())
}

async function blobFromResponseWithLimit(
  response: Response,
  maxSize: number,
  signal: AbortSignal,
): Promise<Blob> {
  if (!response.body) return response.blob()
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      if (signal.aborted) throw new DOMException('File download was cancelled', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxSize) {
        await reader.cancel()
        throw new Error('Large remote ZIP/JAR preview requires HTTP Range support')
      }
      const copy = new Uint8Array(value.byteLength)
      copy.set(value)
      chunks.push(copy)
    }
  } finally {
    reader.releaseLock()
  }
  const parts: ArrayBuffer[] = chunks.map(chunk => {
    const buffer = new ArrayBuffer(chunk.byteLength)
    new Uint8Array(buffer).set(chunk)
    return buffer
  })
  return new Blob(parts, {
    type: response.headers.get('content-type') || 'application/octet-stream',
  })
}

function createHttpRangeSource(
  url: string,
  size: number,
  mimeType: string,
  head: Uint8Array,
  outerSignal: AbortSignal,
): LoadedSource {
  const headCopy = new Uint8Array(head.byteLength)
  headCopy.set(head)
  return {
    // Range-backed ZIP/JAR consumers use readRange. Keeping the first bytes
    // as a Blob preserves the existing descriptor contract for detection.
    blob: new Blob([headCopy.buffer], { type: mimeType }),
    size,
    mimeType,
    head,
    randomAccess: 'http-range',
    async readRange(start, end, signal = outerSignal) {
      const from = Math.max(0, Math.min(size, Math.trunc(start)))
      const to = Math.max(from, Math.min(size, Math.trunc(end)))
      if (to === from) return new Uint8Array()
      const response = await fetch(url, {
        headers: { Range: `bytes=${from}-${to - 1}` },
        signal,
      })
      if (response.status !== 206) {
        await response.body?.cancel()
        throw new Error('Remote server stopped honoring HTTP Range requests')
      }
      const bytes = await bytesFromResponse(response)
      if (bytes.byteLength !== to - from) {
        throw new Error('Remote server returned an incomplete byte range')
      }
      return bytes
    },
  }
}

async function createBlobSource(
  blob: Blob,
  randomAccess: 'memory' | 'blob',
  outerSignal: AbortSignal,
): Promise<LoadedSource> {
  const head = new Uint8Array(await blob.slice(0, HEAD_SIZE).arrayBuffer())
  return {
    blob,
    size: blob.size,
    mimeType: blob.type || 'application/octet-stream',
    head,
    randomAccess,
    async readRange(start, end, signal = outerSignal) {
      if (signal.aborted) throw new DOMException('File read was cancelled', 'AbortError')
      const from = Math.max(0, Math.min(blob.size, Math.trunc(start)))
      const to = Math.max(from, Math.min(blob.size, Math.trunc(end)))
      const bytes = new Uint8Array(await blob.slice(from, to).arrayBuffer())
      if (signal.aborted) throw new DOMException('File read was cancelled', 'AbortError')
      return bytes
    },
  }
}

async function loadRemoteZipSource(
  url: string,
  signal: AbortSignal,
): Promise<LoadedSource | undefined> {
  let size: number | undefined
  let mimeType = 'application/octet-stream'
  let supportsRange = false

  try {
    const headResponse = await fetch(url, { method: 'HEAD', signal })
    if (headResponse.ok) {
      size = parseContentLength(headResponse.headers.get('content-length'))
      mimeType = headResponse.headers.get('content-type') || mimeType
      supportsRange = /\bbytes\b/i.test(headResponse.headers.get('accept-ranges') || '')
    }
  } catch {
    // Some object stores do not expose HEAD through CORS. Probe with a small
    // range request below instead.
  }

  if (size !== undefined && size > MAX_REMOTE_ARCHIVE_SIZE) {
    throw new Error('Remote ZIP/JAR exceeds the 1 GB large-file preview limit')
  }

  if (!supportsRange || size === undefined) {
    const probe = await fetch(url, {
      headers: { Range: `bytes=0-${HEAD_SIZE - 1}` },
      signal,
    })
    if (!probe.ok) throw new Error(`Unable to load file: HTTP ${probe.status}`)
    mimeType = probe.headers.get('content-type') || mimeType

    if (probe.status === 206) {
      size = totalFromContentRange(probe.headers.get('content-range'))
      if (size === undefined) {
        throw new Error('Remote server returned an invalid Content-Range header')
      }
      if (size > MAX_REMOTE_ARCHIVE_SIZE) {
        await probe.body?.cancel()
        throw new Error('Remote ZIP/JAR exceeds the 1 GB large-file preview limit')
      }
      const head = await bytesFromResponse(probe)
      return createHttpRangeSource(url, size, mimeType, head, signal)
    }

    const responseSize = parseContentLength(probe.headers.get('content-length'))
    if (responseSize !== undefined && responseSize > LARGE_REMOTE_ARCHIVE_THRESHOLD) {
      await probe.body?.cancel()
      throw new Error('Large remote ZIP/JAR preview requires HTTP Range support')
    }
    const blob = await blobFromResponseWithLimit(
      probe,
      LARGE_REMOTE_ARCHIVE_THRESHOLD,
      signal,
    )
    return createBlobSource(blob, 'memory', signal)
  }

  if (size === 0) {
    return createHttpRangeSource(url, size, mimeType, new Uint8Array(), signal)
  }
  const headResponse = await fetch(url, {
    headers: { Range: `bytes=0-${Math.min(size - 1, HEAD_SIZE - 1)}` },
    signal,
  })
  if (headResponse.status !== 206) {
    await headResponse.body?.cancel()
    if (size > LARGE_REMOTE_ARCHIVE_THRESHOLD) {
      throw new Error('Large remote ZIP/JAR preview requires HTTP Range support')
    }
    return undefined
  }
  const head = await bytesFromResponse(headResponse)
  return createHttpRangeSource(url, size, mimeType, head, signal)
}

export async function createFileDescriptor(
  source: FileSource,
  options: OpenFileOptions,
  signal: AbortSignal,
): Promise<FileDescriptor> {
  const inferredName = source instanceof File
    ? source.name
    : typeof source === 'string'
      ? filenameFromUrl(source)
      : DEFAULT_NAME
  const name = options.name || inferredName
  const extension = extensionFromName(name)

  let loaded: LoadedSource | undefined
  if (typeof source === 'string' && rangeArchiveExtensions.has(extension)) {
    loaded = await loadRemoteZipSource(source, signal)
  }
  if (!loaded) {
    const blob = await sourceToBlob(source, signal)
    loaded = await createBlobSource(
      blob,
      source instanceof Blob ? 'blob' : 'memory',
      signal,
    )
  }

  return {
    source,
    blob: loaded.blob,
    name,
    extension,
    mimeType: options.mimeType || loaded.mimeType,
    size: loaded.size,
    head: loaded.head,
    readRange: loaded.readRange,
    randomAccess: loaded.randomAccess,
  }
}
