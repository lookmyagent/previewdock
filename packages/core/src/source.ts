import type { FileDescriptor, FileSource, OpenFileOptions } from './types'

const DEFAULT_NAME = 'untitled'
const HEAD_SIZE = 64 * 1024

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

export async function createFileDescriptor(
  source: FileSource,
  options: OpenFileOptions,
  signal: AbortSignal,
): Promise<FileDescriptor> {
  const blob = await sourceToBlob(source, signal)
  const inferredName = source instanceof File
    ? source.name
    : typeof source === 'string'
      ? filenameFromUrl(source)
      : DEFAULT_NAME
  const name = options.name || inferredName
  const head = new Uint8Array(await blob.slice(0, HEAD_SIZE).arrayBuffer())

  return {
    source,
    blob,
    name,
    extension: extensionFromName(name),
    mimeType: options.mimeType || blob.type || 'application/octet-stream',
    size: blob.size,
    head,
  }
}
