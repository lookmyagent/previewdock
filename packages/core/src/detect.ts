import type { FileDescriptor } from './types'

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length))
}

export function detectMimeFromMagic(head: Uint8Array): string | undefined {
  if (ascii(head, 0, 5) === '%PDF-') {
    return 'application/pdf'
  }
  if (head[0] === 0x89 && ascii(head, 1, 3) === 'PNG') {
    return 'image/png'
  }
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return 'image/jpeg'
  }
  if (ascii(head, 0, 3) === 'GIF') {
    return 'image/gif'
  }
  if (ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 4) === 'WEBP') {
    return 'image/webp'
  }
  if (head[0] === 0x50 && head[1] === 0x4b) {
    return 'application/zip'
  }
  if (
    head[0] === 0x52 && head[1] === 0x61 && head[2] === 0x72
    && head[3] === 0x21 && head[4] === 0x1a && head[5] === 0x07
  ) {
    return 'application/vnd.rar'
  }
  if (
    head[0] === 0x37 && head[1] === 0x7a && head[2] === 0xbc
    && head[3] === 0xaf && head[4] === 0x27 && head[5] === 0x1c
  ) {
    return 'application/x-7z-compressed'
  }
  if (head[0] === 0x1f && head[1] === 0x8b) {
    return 'application/gzip'
  }
  if (ascii(head, 257, 5) === 'ustar') {
    return 'application/x-tar'
  }
  return undefined
}

export function enrichDetection(file: FileDescriptor): FileDescriptor {
  if (file.mimeType !== 'application/octet-stream') {
    return file
  }
  return {
    ...file,
    mimeType: detectMimeFromMagic(file.head) || file.mimeType,
  }
}
