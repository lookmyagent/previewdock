import type { FileDescriptor } from '@previewdock/core'
import { strToU8, zipSync } from 'fflate'
import { describe, expect, it, vi } from 'vitest'
import { readZipDirectory, readZipEntry, type ZipSafetyLimits } from './zip'

const limits: ZipSafetyLimits = {
  maxEntries: 10_000,
  maxExpandedSize: 500 * 1024 * 1024,
  maxEntrySize: 100 * 1024 * 1024,
  maxCompressionRatio: 100,
  maxDepth: 16,
}

function descriptorFromBytes(bytes: Uint8Array, readRange = vi.fn()): FileDescriptor {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const blob = new Blob([copy.buffer], { type: 'application/zip' })
  readRange.mockImplementation(async (start: number, end: number) => (
    new Uint8Array(await blob.slice(start, end).arrayBuffer())
  ))
  return {
    source: blob,
    blob,
    name: 'sample.zip',
    extension: 'zip',
    mimeType: 'application/zip',
    size: blob.size,
    head: bytes.slice(0, 64 * 1024),
    readRange,
    randomAccess: 'blob',
  }
}

describe('range-backed ZIP browsing', () => {
  it('lists from the central directory and extracts only the selected entry', async () => {
    const largeStoredFile = new Uint8Array(160 * 1024)
    largeStoredFile.fill(7)
    const archive = zipSync({
      'assets/large.bin': [largeStoredFile, { level: 0 }],
      'docs/readme.txt': strToU8('PreviewDock large ZIP'),
    })
    const readRange = vi.fn()
    const descriptor = descriptorFromBytes(archive, readRange)
    const signal = new AbortController().signal

    const entries = await readZipDirectory(descriptor, signal, limits)
    expect(entries.map(entry => entry.path)).toEqual([
      'assets/large.bin',
      'docs/readme.txt',
    ])
    expect(readRange).not.toHaveBeenCalledWith(0, descriptor.size, signal)

    const readme = entries.find(entry => entry.path === 'docs/readme.txt')
    expect(readme).toBeDefined()
    const output = await readZipEntry(descriptor, readme!, signal, limits.maxEntrySize)
    expect(new TextDecoder().decode(output)).toBe('PreviewDock large ZIP')
  })

  it('blocks highly compressed entries before extraction', async () => {
    const repeated = new Uint8Array(2 * 1024 * 1024)
    repeated.fill(65)
    const archive = zipSync({ 'bomb-like.txt': repeated }, { level: 9 })
    const descriptor = descriptorFromBytes(archive)

    await expect(readZipDirectory(
      descriptor,
      new AbortController().signal,
      limits,
    )).rejects.toThrow('unsafe compression ratio')
  })

  it('indexes a large logical ZIP without reading the complete file', async () => {
    const archive = zipSync({ 'docs/readme.txt': strToU8('range-backed') })
    const archiveView = new DataView(archive.buffer, archive.byteOffset, archive.byteLength)
    let eocdOffset = -1
    for (let offset = archive.byteLength - 22; offset >= 0; offset -= 1) {
      if (archiveView.getUint32(offset, true) === 0x06054b50) {
        eocdOffset = offset
        break
      }
    }
    expect(eocdOffset).toBeGreaterThanOrEqual(0)
    const logicalSize = 200 * 1024 * 1024
    const readRange = vi.fn(async (start: number, end: number) => {
      const output = new Uint8Array(end - start)
      const virtualEocdStart = logicalSize - 22
      if (start <= virtualEocdStart && end >= logicalSize) {
        output.set(archive.slice(eocdOffset, eocdOffset + 22), virtualEocdStart - start)
        return output
      }
      output.set(archive.slice(start, Math.min(end, archive.byteLength)))
      return output
    })
    const descriptor: FileDescriptor = {
      ...descriptorFromBytes(archive),
      size: logicalSize,
      readRange,
      randomAccess: 'http-range',
    }

    const entries = await readZipDirectory(
      descriptor,
      new AbortController().signal,
      { ...limits, maxExpandedSize: 5 * 1024 * 1024 * 1024, maxEntries: 20_000 },
    )

    expect(entries.map(entry => entry.path)).toEqual(['docs/readme.txt'])
    expect(readRange).not.toHaveBeenCalledWith(0, logicalSize, expect.anything())
    expect(readRange.mock.calls[0]?.[0]).toBeGreaterThan(100 * 1024 * 1024)
  })

  it('blocks paths deeper than the configured directory budget', async () => {
    const archive = zipSync({ 'a/b/c/file.txt': strToU8('deep') })
    const descriptor = descriptorFromBytes(archive)

    await expect(readZipDirectory(
      descriptor,
      new AbortController().signal,
      { ...limits, maxDepth: 3 },
    )).rejects.toThrow('depth limit')
  })
})
