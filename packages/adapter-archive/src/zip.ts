import type { FileDescriptor } from '@previewdock/core'
import { inflate } from 'fflate'

const EOCD_SIGNATURE = 0x06054b50
const ZIP64_EOCD_SIGNATURE = 0x06064b50
const ZIP64_LOCATOR_SIGNATURE = 0x07064b50
const CENTRAL_FILE_SIGNATURE = 0x02014b50
const LOCAL_FILE_SIGNATURE = 0x04034b50
const ZIP64_EXTRA_ID = 0x0001
const MAX_EOCD_SEARCH = 65_557
const MAX_DIRECTORY_SIZE = 64 * 1024 * 1024

export interface ZipSafetyLimits {
  maxEntries: number
  maxExpandedSize: number
  maxEntrySize: number
  maxCompressionRatio: number
  maxDepth: number
}

export interface ZipDirectoryEntry {
  path: string
  size: number
  compressedSize: number
  directory: boolean
  encrypted: boolean
  compressionMethod: number
  localHeaderOffset: number
}

function abortError(): DOMException {
  return new DOMException('Archive operation was cancelled', 'AbortError')
}

function assertAvailable(bytes: Uint8Array, offset: number, length: number, message: string): void {
  if (offset < 0 || length < 0 || offset + length > bytes.byteLength) {
    throw new Error(message)
  }
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

function safeNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} exceeds the browser numeric limit`)
  }
  return Number(value)
}

function decodeName(bytes: Uint8Array, utf8: boolean): string {
  try {
    return new TextDecoder(utf8 ? 'utf-8' : 'gb18030', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('latin1').decode(bytes)
  }
}

function normalizePath(value: string): string {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .filter(part => part && part !== '.')
    .map(part => part === '..' ? '__' : part)
    .join('/')
}

function findEocd(bytes: Uint8Array): number {
  const data = view(bytes)
  for (let offset = bytes.byteLength - 22; offset >= 0; offset -= 1) {
    if (data.getUint32(offset, true) !== EOCD_SIGNATURE) continue
    const commentLength = data.getUint16(offset + 20, true)
    if (offset + 22 + commentLength <= bytes.byteLength) return offset
  }
  throw new Error('ZIP central directory was not found')
}

async function readZip64Directory(
  file: FileDescriptor,
  eocdAbsoluteOffset: number,
  signal: AbortSignal,
): Promise<{ entries: number, size: number, offset: number }> {
  if (eocdAbsoluteOffset < 20) throw new Error('ZIP64 locator is missing')
  const locator = await file.readRange(eocdAbsoluteOffset - 20, eocdAbsoluteOffset, signal)
  assertAvailable(locator, 0, 20, 'ZIP64 locator is truncated')
  const locatorView = view(locator)
  if (locatorView.getUint32(0, true) !== ZIP64_LOCATOR_SIGNATURE) {
    throw new Error('ZIP64 locator is missing')
  }
  const recordOffset = safeNumber(locatorView.getBigUint64(8, true), 'ZIP64 record offset')
  const record = await file.readRange(recordOffset, recordOffset + 56, signal)
  assertAvailable(record, 0, 56, 'ZIP64 directory record is truncated')
  const recordView = view(record)
  if (recordView.getUint32(0, true) !== ZIP64_EOCD_SIGNATURE) {
    throw new Error('ZIP64 directory record is invalid')
  }
  return {
    entries: safeNumber(recordView.getBigUint64(32, true), 'ZIP entry count'),
    size: safeNumber(recordView.getBigUint64(40, true), 'ZIP directory size'),
    offset: safeNumber(recordView.getBigUint64(48, true), 'ZIP directory offset'),
  }
}

function readZip64Extra(
  bytes: Uint8Array,
  needs: { size: boolean, compressedSize: boolean, offset: boolean },
): Partial<Pick<ZipDirectoryEntry, 'size' | 'compressedSize' | 'localHeaderOffset'>> {
  const data = view(bytes)
  let cursor = 0
  while (cursor + 4 <= bytes.byteLength) {
    const id = data.getUint16(cursor, true)
    const length = data.getUint16(cursor + 2, true)
    const bodyStart = cursor + 4
    const bodyEnd = bodyStart + length
    if (bodyEnd > bytes.byteLength) break
    if (id === ZIP64_EXTRA_ID) {
      let valueOffset = bodyStart
      const result: Partial<Pick<ZipDirectoryEntry, 'size' | 'compressedSize' | 'localHeaderOffset'>> = {}
      if (needs.size) {
        assertAvailable(bytes, valueOffset, 8, 'ZIP64 uncompressed size is missing')
        result.size = safeNumber(data.getBigUint64(valueOffset, true), 'ZIP entry size')
        valueOffset += 8
      }
      if (needs.compressedSize) {
        assertAvailable(bytes, valueOffset, 8, 'ZIP64 compressed size is missing')
        result.compressedSize = safeNumber(
          data.getBigUint64(valueOffset, true),
          'ZIP compressed entry size',
        )
        valueOffset += 8
      }
      if (needs.offset) {
        assertAvailable(bytes, valueOffset, 8, 'ZIP64 local header offset is missing')
        result.localHeaderOffset = safeNumber(
          data.getBigUint64(valueOffset, true),
          'ZIP local header offset',
        )
      }
      return result
    }
    cursor = bodyEnd
  }
  throw new Error('ZIP64 entry metadata is missing')
}

function validateEntry(
  entry: ZipDirectoryEntry,
  limits: ZipSafetyLimits,
  expandedTotal: number,
): number {
  if (entry.path.split('/').length > limits.maxDepth) {
    throw new Error(`Archive path exceeds the ${limits.maxDepth}-level depth limit`)
  }
  if (!entry.directory && entry.size > limits.maxEntrySize) {
    throw new Error('Archive contains a file larger than the per-file preview limit')
  }
  if (
    !entry.directory
    && entry.size > 1024 * 1024
    && entry.size / Math.max(1, entry.compressedSize) > limits.maxCompressionRatio
  ) {
    throw new Error('Archive contains a file with an unsafe compression ratio')
  }
  const nextTotal = expandedTotal + entry.size
  if (nextTotal > limits.maxExpandedSize) {
    throw new Error('Expanded archive exceeds the preview budget')
  }
  return nextTotal
}

export async function readZipDirectory(
  file: FileDescriptor,
  signal: AbortSignal,
  limits: ZipSafetyLimits,
): Promise<ZipDirectoryEntry[]> {
  if (signal.aborted) throw abortError()
  if (file.size < 22) throw new Error('ZIP file is truncated')
  const tailStart = Math.max(0, file.size - MAX_EOCD_SEARCH)
  const tail = await file.readRange(tailStart, file.size, signal)
  const eocdOffset = findEocd(tail)
  const eocd = view(tail)
  const eocdAbsoluteOffset = tailStart + eocdOffset
  const standardEntries = eocd.getUint16(eocdOffset + 10, true)
  const standardSize = eocd.getUint32(eocdOffset + 12, true)
  const standardOffset = eocd.getUint32(eocdOffset + 16, true)
  const zip64 = standardEntries === 0xffff
    || standardSize === 0xffffffff
    || standardOffset === 0xffffffff

  const directory = zip64
    ? await readZip64Directory(file, eocdAbsoluteOffset, signal)
    : { entries: standardEntries, size: standardSize, offset: standardOffset }

  if (directory.entries > limits.maxEntries) {
    throw new Error(`Archive contains more than ${limits.maxEntries} entries`)
  }
  if (directory.size > MAX_DIRECTORY_SIZE) {
    throw new Error('ZIP directory metadata exceeds the 64 MB preview limit')
  }
  if (directory.offset + directory.size > file.size) {
    throw new Error('ZIP central directory points outside the file')
  }

  const bytes = await file.readRange(
    directory.offset,
    directory.offset + directory.size,
    signal,
  )
  const data = view(bytes)
  const entries: ZipDirectoryEntry[] = []
  let cursor = 0
  let expandedTotal = 0

  while (cursor < bytes.byteLength && entries.length < directory.entries) {
    assertAvailable(bytes, cursor, 46, 'ZIP directory entry is truncated')
    if (data.getUint32(cursor, true) !== CENTRAL_FILE_SIGNATURE) {
      throw new Error('ZIP directory contains an invalid file header')
    }
    const flags = data.getUint16(cursor + 8, true)
    const compressionMethod = data.getUint16(cursor + 10, true)
    const standardCompressedSize = data.getUint32(cursor + 20, true)
    const standardEntrySize = data.getUint32(cursor + 24, true)
    const nameLength = data.getUint16(cursor + 28, true)
    const extraLength = data.getUint16(cursor + 30, true)
    const commentLength = data.getUint16(cursor + 32, true)
    const externalAttributes = data.getUint32(cursor + 38, true)
    const standardLocalOffset = data.getUint32(cursor + 42, true)
    const totalLength = 46 + nameLength + extraLength + commentLength
    assertAvailable(bytes, cursor, totalLength, 'ZIP directory entry metadata is truncated')

    const rawName = bytes.slice(cursor + 46, cursor + 46 + nameLength)
    const originalPath = decodeName(rawName, (flags & 0x0800) !== 0)
    const path = normalizePath(originalPath)
    const extra = bytes.slice(
      cursor + 46 + nameLength,
      cursor + 46 + nameLength + extraLength,
    )
    const needsZip64 = {
      size: standardEntrySize === 0xffffffff,
      compressedSize: standardCompressedSize === 0xffffffff,
      offset: standardLocalOffset === 0xffffffff,
    }
    const zip64Values = Object.values(needsZip64).some(Boolean)
      ? readZip64Extra(extra, needsZip64)
      : {}
    const directoryEntry = originalPath.endsWith('/')
      || (externalAttributes & 0x10) !== 0
    const entry: ZipDirectoryEntry = {
      path,
      size: directoryEntry ? 0 : (zip64Values.size ?? standardEntrySize),
      compressedSize: directoryEntry
        ? 0
        : (zip64Values.compressedSize ?? standardCompressedSize),
      directory: directoryEntry,
      encrypted: (flags & 0x0001) !== 0,
      compressionMethod,
      localHeaderOffset: zip64Values.localHeaderOffset ?? standardLocalOffset,
    }

    if (entry.path) {
      expandedTotal = validateEntry(entry, limits, expandedTotal)
      entries.push(entry)
    }
    cursor += totalLength
  }

  if (entries.length !== directory.entries) {
    throw new Error('ZIP directory entry count does not match its metadata')
  }
  return entries
}

function inflateAsync(compressed: Uint8Array, signal: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError())
      return
    }
    let settled = false
    const terminate = inflate(compressed, { consume: true }, (error, output) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve(output)
    })
    const onAbort = () => {
      if (settled) return
      settled = true
      terminate()
      reject(abortError())
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export async function readZipEntry(
  file: FileDescriptor,
  entry: ZipDirectoryEntry,
  signal: AbortSignal,
  maxEntrySize: number,
): Promise<Uint8Array> {
  if (entry.directory) return new Uint8Array()
  if (entry.encrypted) throw new Error('Password-protected ZIP entries are not supported yet')
  if (entry.size > maxEntrySize) {
    throw new Error('Selected file exceeds the per-file preview limit')
  }
  const localHeader = await file.readRange(
    entry.localHeaderOffset,
    entry.localHeaderOffset + 30,
    signal,
  )
  assertAvailable(localHeader, 0, 30, 'ZIP local file header is truncated')
  const header = view(localHeader)
  if (header.getUint32(0, true) !== LOCAL_FILE_SIGNATURE) {
    throw new Error('ZIP local file header is invalid')
  }
  const nameLength = header.getUint16(26, true)
  const extraLength = header.getUint16(28, true)
  const dataStart = entry.localHeaderOffset + 30 + nameLength + extraLength
  if (dataStart + entry.compressedSize > file.size) {
    throw new Error('ZIP entry points outside the file')
  }
  const compressed = await file.readRange(
    dataStart,
    dataStart + entry.compressedSize,
    signal,
  )
  let output: Uint8Array
  if (entry.compressionMethod === 0) {
    output = compressed
  } else if (entry.compressionMethod === 8) {
    output = await inflateAsync(compressed, signal)
  } else {
    throw new Error(`ZIP compression method ${entry.compressionMethod} is not supported`)
  }
  if (output.byteLength !== entry.size) {
    throw new Error('ZIP entry size does not match its directory metadata')
  }
  return output
}
