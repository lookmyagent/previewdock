import { describe, expect, it } from 'vitest'
import { detectMimeFromMagic } from './detect'

describe('detectMimeFromMagic', () => {
  it('detects PDF and PNG signatures', () => {
    expect(detectMimeFromMagic(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf')
    expect(detectMimeFromMagic(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe('image/png')
  })

  it('detects RAR, 7Z, GZIP and TAR signatures', () => {
    expect(detectMimeFromMagic(new Uint8Array([
      0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00,
    ]))).toBe('application/vnd.rar')
    expect(detectMimeFromMagic(new Uint8Array([
      0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c,
    ]))).toBe('application/x-7z-compressed')
    expect(detectMimeFromMagic(new Uint8Array([0x1f, 0x8b, 0x08]))).toBe('application/gzip')

    const tarHeader = new Uint8Array(512)
    tarHeader.set(new TextEncoder().encode('ustar'), 257)
    expect(detectMimeFromMagic(tarHeader)).toBe('application/x-tar')
  })
})
