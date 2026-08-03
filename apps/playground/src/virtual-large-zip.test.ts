import { describe, expect, it } from 'vitest'
import type { FileDescriptor } from '@previewdock/core'
import { readZipDirectory, readZipEntry } from '../../../packages/adapter-archive/src/zip'
import { createVirtualLargeZip, virtualLargeZipStats } from './virtual-large-zip'

function descriptor(blob: Blob): FileDescriptor {
  return {
    source: blob,
    blob,
    name: 'large-sample.zip',
    extension: 'zip',
    mimeType: 'application/zip',
    size: blob.size,
    head: new Uint8Array(),
    randomAccess: 'blob',
    async readRange(start, end) {
      return new Uint8Array(await blob.slice(start, end).arrayBuffer())
    },
  }
}

describe('virtual large ZIP sample', () => {
  it('exposes a valid large-file ZIP tail without materializing the full archive', async () => {
    const archive = createVirtualLargeZip()
    const tail = new Uint8Array(await archive.slice(-22).arrayBuffer())
    const view = new DataView(tail.buffer)

    expect(archive).toBeInstanceOf(Blob)
    expect(archive.size).toBeGreaterThan(100 * 1024 * 1024)
    expect(view.getUint32(0, true)).toBe(0x06054b50)
    expect(view.getUint16(10, true)).toBe(virtualLargeZipStats.entries)
  })

  it('returns deterministic byte ranges from a virtual entry payload', async () => {
    const archive = createVirtualLargeZip()
    const firstHeader = new Uint8Array(await archive.slice(0, 30).arrayBuffer())
    const header = new DataView(firstHeader.buffer)
    const nameLength = header.getUint16(26, true)
    const payload = new Uint8Array(await archive.slice(30 + nameLength, 30 + nameLength + 48).arrayBuffer())

    expect(header.getUint32(0, true)).toBe(0x04034b50)
    expect(new TextDecoder().decode(payload)).toContain('PreviewDock large archive sample')
    expect(virtualLargeZipStats.entrySize).toBe(1024 * 1024)
  })

  it('supports directory parsing and selected-entry extraction', async () => {
    const archive = createVirtualLargeZip()
    const file = descriptor(archive)
    const signal = new AbortController().signal
    const limits = {
      maxEntries: 20_000,
      maxExpandedSize: 5 * 1024 * 1024 * 1024,
      maxEntrySize: 100 * 1024 * 1024,
      maxCompressionRatio: 100,
      maxDepth: 16,
    }
    const entries = await readZipDirectory(file, signal, limits)
    const selected = await readZipEntry(file, entries[0]!, signal, limits.maxEntrySize)

    expect(entries).toHaveLength(virtualLargeZipStats.entries)
    expect(entries[0]?.path).toBe('reports/department-001.txt')
    expect(selected).toHaveLength(virtualLargeZipStats.entrySize)
    expect(new TextDecoder().decode(selected.subarray(0, 64))).toContain('PreviewDock large archive')
  })
})
