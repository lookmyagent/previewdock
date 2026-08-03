const ENTRY_COUNT = 110
const ENTRY_SIZE = 1024 * 1024
const UTF8_FLAG = 0x0800

interface VirtualSegment {
  start: number
  end: number
  bytes?: Uint8Array
  payload?: true
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function createPayload(): Uint8Array {
  const line = new TextEncoder().encode(
    'PreviewDock large archive sample | generated report data | open only the selected file\n',
  )
  const payload = new Uint8Array(ENTRY_SIZE)
  for (let offset = 0; offset < payload.byteLength; offset += line.byteLength) {
    payload.set(line.subarray(0, Math.min(line.byteLength, payload.byteLength - offset)), offset)
  }
  return payload
}

function localHeader(name: Uint8Array, checksum: number): Uint8Array {
  const bytes = new Uint8Array(30 + name.byteLength)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x04034b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, UTF8_FLAG, true)
  view.setUint16(8, 0, true)
  view.setUint32(14, checksum, true)
  view.setUint32(18, ENTRY_SIZE, true)
  view.setUint32(22, ENTRY_SIZE, true)
  view.setUint16(26, name.byteLength, true)
  bytes.set(name, 30)
  return bytes
}

function centralHeader(name: Uint8Array, checksum: number, localOffset: number): Uint8Array {
  const bytes = new Uint8Array(46 + name.byteLength)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x02014b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 20, true)
  view.setUint16(8, UTF8_FLAG, true)
  view.setUint16(10, 0, true)
  view.setUint32(16, checksum, true)
  view.setUint32(20, ENTRY_SIZE, true)
  view.setUint32(24, ENTRY_SIZE, true)
  view.setUint16(28, name.byteLength, true)
  view.setUint32(42, localOffset, true)
  bytes.set(name, 46)
  return bytes
}

function endOfCentralDirectory(entries: number, directorySize: number, directoryOffset: number): Uint8Array {
  const bytes = new Uint8Array(22)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(8, entries, true)
  view.setUint16(10, entries, true)
  view.setUint32(12, directorySize, true)
  view.setUint32(16, directoryOffset, true)
  return bytes
}

function normalizeOffset(value: number | undefined, size: number, fallback: number): number {
  if (value === undefined) return fallback
  const finite = Number.isFinite(value) ? Math.trunc(value) : 0
  return finite < 0 ? Math.max(size + finite, 0) : Math.min(finite, size)
}

class VirtualLargeZipBlob extends Blob {
  readonly #payload = createPayload()
  readonly #segments: VirtualSegment[] = []
  readonly #virtualSize: number

  constructor() {
    super([], { type: 'application/zip' })
    const encoder = new TextEncoder()
    const checksum = crc32(this.#payload)
    const centralHeaders: Uint8Array[] = []
    let offset = 0

    for (let index = 1; index <= ENTRY_COUNT; index += 1) {
      const name = encoder.encode(`reports/department-${String(index).padStart(3, '0')}.txt`)
      const header = localHeader(name, checksum)
      this.#segments.push({ start: offset, end: offset + header.byteLength, bytes: header })
      centralHeaders.push(centralHeader(name, checksum, offset))
      offset += header.byteLength
      this.#segments.push({ start: offset, end: offset + ENTRY_SIZE, payload: true })
      offset += ENTRY_SIZE
    }

    const directoryOffset = offset
    const directorySize = centralHeaders.reduce((total, header) => total + header.byteLength, 0)
    const directory = new Uint8Array(directorySize)
    let directoryCursor = 0
    for (const header of centralHeaders) {
      directory.set(header, directoryCursor)
      directoryCursor += header.byteLength
    }
    this.#segments.push({ start: offset, end: offset + directory.byteLength, bytes: directory })
    offset += directory.byteLength

    const eocd = endOfCentralDirectory(ENTRY_COUNT, directorySize, directoryOffset)
    this.#segments.push({ start: offset, end: offset + eocd.byteLength, bytes: eocd })
    this.#virtualSize = offset + eocd.byteLength
  }

  override get size(): number {
    return this.#virtualSize
  }

  override get type(): string {
    return 'application/zip'
  }

  override slice(start?: number, end?: number, contentType?: string): Blob {
    const from = normalizeOffset(start, this.size, 0)
    const to = Math.max(from, normalizeOffset(end, this.size, this.size))
    const output = new Uint8Array(to - from)

    for (const segment of this.#segments) {
      const overlapStart = Math.max(from, segment.start)
      const overlapEnd = Math.min(to, segment.end)
      if (overlapStart >= overlapEnd) continue
      const sourceStart = overlapStart - segment.start
      const targetStart = overlapStart - from
      const length = overlapEnd - overlapStart
      const source = segment.payload ? this.#payload : segment.bytes
      if (source) output.set(source.subarray(sourceStart, sourceStart + length), targetStart)
    }

    return new Blob([output], { type: contentType ?? this.type })
  }
}

export function createVirtualLargeZip(): Blob {
  return new VirtualLargeZipBlob()
}

export const virtualLargeZipStats = {
  entries: ENTRY_COUNT,
  entrySize: ENTRY_SIZE,
}
