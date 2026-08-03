import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'
import { gunzip, unzipSync } from 'fflate'
import {
  readZipDirectory,
  readZipEntry,
  type ZipSafetyLimits,
} from './zip'

interface ArchiveEntry {
  path: string
  size: number
  directory: boolean
  data?: Uint8Array
  loadData?: (signal: AbortSignal) => Promise<Uint8Array>
}

interface ArchiveListing {
  entries: ArchiveEntry[]
  dispose: () => void | Promise<void>
}

export interface ArchiveRuntimeOptions {
  /** URL of libarchive.js' worker-bundle.js; libarchive.wasm must be beside it. */
  workerUrl?: string
  /** Optional explicit WASM URL, useful when the worker is served by a CDN. */
  wasmUrl?: string
  /**
   * Repairs a libarchive.js 2.0.x 7Z entry-type bug in memory. Disable only
   * when workerUrl already points to a repaired/custom worker.
   */
  patchWorker?: boolean
  /**
   * Optional bridge to the host viewer for formats not rendered directly by
   * this adapter (for example DOCX, XLSX, PPTX, DOC, PSD or 3D models).
   */
  previewEntry?: (request: ArchiveEntryPreviewRequest) => (
    void | (() => void | Promise<void>) | Promise<void | (() => void | Promise<void>)>
  )
  /** Product-level safety limits. Omitted values use production defaults. */
  limits?: Partial<ArchiveSafetyLimits>
}

export interface ArchiveSafetyLimits {
  normalInputSize: number
  largeZipInputSize: number
  normalExpandedSize: number
  largeZipExpandedSize: number
  maxEntrySize: number
  normalEntries: number
  largeZipEntries: number
  maxCompressionRatio: number
  maxDepth: number
  directoryTimeoutMs: number
  extractionTimeoutMs: number
}

export interface ArchiveEntryPreviewRequest {
  file: File
  container: HTMLElement
  signal: AbortSignal
}

interface ArchiveLabels {
  entries: string
  standardMode: string
  largeMode: string
  root: string
  folder: string
  file: string
  emptyFolder: string
  selectFile: string
  download: string
  unavailable: string
  previewing: string
  loading: string
  loadFailed: string
  extractionTimeout: string
}

const archiveExtensions = new Set(['zip', 'jar', 'tar', 'gz', 'gzip', 'tgz', 'rar', '7z'])
const textExtensions = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'log',
  'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'html', 'htm',
  'java', 'php', 'py', 'c', 'cpp', 'h', 'hpp', 'sql', 'sh', 'yaml', 'yml',
  'mf', 'properties', 'ini', 'cfg', 'conf',
])
const imageExtensions = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'jfif', 'svg',
])
const audioExtensions = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus'])
const videoExtensions = new Set(['mp4', 'webm', 'ogv', 'mov', 'm4v'])

const DEFAULT_LIMITS: ArchiveSafetyLimits = {
  normalInputSize: 100 * 1024 * 1024,
  largeZipInputSize: 1024 * 1024 * 1024,
  normalExpandedSize: 500 * 1024 * 1024,
  largeZipExpandedSize: 5 * 1024 * 1024 * 1024,
  maxEntrySize: 100 * 1024 * 1024,
  normalEntries: 10_000,
  largeZipEntries: 20_000,
  maxCompressionRatio: 100,
  maxDepth: 16,
  directoryTimeoutMs: 15_000,
  extractionTimeoutMs: 30_000,
}
const MAX_OUTPUT_SIZE = DEFAULT_LIMITS.normalExpandedSize
const MAX_ENTRIES = DEFAULT_LIMITS.normalEntries
let runtimeOptions: ArchiveRuntimeOptions = {}

export function configureArchiveRuntime(options: ArchiveRuntimeOptions = {}): void {
  runtimeOptions = { ...options }
}

function safetyLimits(): ArchiveSafetyLimits {
  return { ...DEFAULT_LIMITS, ...runtimeOptions.limits }
}

function zipSafetyLimits(file: FileDescriptor): ZipSafetyLimits {
  const limits = safetyLimits()
  const large = file.size > limits.normalInputSize
  return {
    maxEntries: large ? limits.largeZipEntries : limits.normalEntries,
    maxExpandedSize: large ? limits.largeZipExpandedSize : limits.normalExpandedSize,
    maxEntrySize: limits.maxEntrySize,
    maxCompressionRatio: limits.maxCompressionRatio,
    maxDepth: limits.maxDepth,
  }
}

async function withOperationTimeout<T>(
  outerSignal: AbortSignal,
  timeoutMs: number,
  timeoutMessage: string,
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  let timedOut = false
  const abort = () => controller.abort()
  if (outerSignal.aborted) controller.abort()
  outerSignal.addEventListener('abort', abort, { once: true })
  const timer = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  try {
    return await operation(controller.signal)
  } catch (error) {
    if (timedOut) throw new Error(timeoutMessage)
    throw error
  } finally {
    globalThis.clearTimeout(timer)
    outerSignal.removeEventListener('abort', abort)
  }
}

function supportsArchive(file: FileDescriptor): boolean {
  return archiveExtensions.has(file.extension)
    || [
      'application/zip',
      'application/java-archive',
      'application/gzip',
      'application/x-gzip',
      'application/x-tar',
      'application/vnd.rar',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ].includes(file.mimeType)
}

function labels(): ArchiveLabels {
  if (document.documentElement.lang.toLowerCase().startsWith('zh')) {
    return {
      entries: '个条目',
      standardMode: '普通模式',
      largeMode: '大文件模式 · 按文件读取',
      root: '压缩包',
      folder: '文件夹',
      file: '文件',
      emptyFolder: '此文件夹为空',
      selectFile: '选择左侧文件即可在这里查看内容',
      download: '下载原文件',
      unavailable: '此文件暂不支持直接预览，可以下载后打开。',
      previewing: '正在查看',
      loading: '正在解压所选文件…',
      loadFailed: '文件解压失败',
      extractionTimeout: '解压任务已超时',
    }
  }
  return {
    entries: 'entries',
    standardMode: 'Standard mode',
    largeMode: 'Large-file mode · reads selected entries',
    root: 'Archive',
    folder: 'Folder',
    file: 'File',
    emptyFolder: 'This folder is empty',
    selectFile: 'Select a file on the left to preview its contents',
    download: 'Download original',
    unavailable: 'This file cannot be previewed here. Download it to open locally.',
    previewing: 'Previewing',
    loading: 'Extracting the selected file…',
    loadFailed: 'Unable to extract this file',
    extractionTimeout: 'The extraction task timed out',
  }
}

function decodeArchiveText(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('latin1').decode(bytes)
  }
}

function readTarString(bytes: Uint8Array, start: number, length: number): string {
  return decodeArchiveText(bytes.slice(start, start + length))
    .replace(/\0.*$/s, '')
    .replace(/\s+$/g, '')
}

function normalizePath(value: string): string {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .filter(part => part && part !== '.')
    .map(part => part === '..' ? '__' : part)
    .join('/')
}

function readTarNumber(bytes: Uint8Array, start: number, length: number): number {
  const field = bytes.slice(start, start + length)
  if (field[0] && (field[0] & 0x80) !== 0) {
    // POSIX base-256 extension. Archive sizes are non-negative, so clear the
    // marker bit and parse the remaining unsigned big-endian value.
    let value = BigInt(field[0] & 0x7f)
    for (const byte of field.slice(1)) value = (value << 8n) | BigInt(byte)
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('TAR entry size exceeds the browser numeric limit')
    }
    return Number(value)
  }
  const octal = decodeArchiveText(field).replace(/\0.*$/s, '').trim()
  return Number.parseInt(octal || '0', 8) || 0
}

function parsePaxAttributes(data: Uint8Array): Record<string, string> {
  const attributes: Record<string, string> = {}
  let offset = 0
  while (offset < data.length) {
    const separator = data.indexOf(0x20, offset)
    if (separator < 0) break
    const length = Number.parseInt(decodeArchiveText(data.slice(offset, separator)), 10)
    if (!Number.isFinite(length) || length <= 0 || offset + length > data.length) break
    const record = decodeArchiveText(data.slice(separator + 1, offset + length))
      .replace(/\n$/, '')
    const equals = record.indexOf('=')
    if (equals > 0) attributes[record.slice(0, equals)] = record.slice(equals + 1)
    offset += length
  }
  return attributes
}

function isArchiveMetadataPath(path: string): boolean {
  const parts = path.split('/')
  return parts.includes('__MACOSX')
    || parts.some(part => part === '.DS_Store' || part.startsWith('._'))
}

export function parseTarEntries(bytes: Uint8Array): ArchiveEntry[] {
  const entries: ArchiveEntry[] = []
  let offset = 0
  let pendingLongPath = ''
  let pendingPax: Record<string, string> = {}
  let globalPax: Record<string, string> = {}
  while (offset + 512 <= bytes.length && entries.length < MAX_ENTRIES) {
    const header = bytes.slice(offset, offset + 512)
    if (header.every(byte => byte === 0)) break
    const name = readTarString(bytes, offset, 100)
    if (!name) throw new Error('TAR contains an invalid empty entry name')
    const prefix = readTarString(bytes, offset + 345, 155)
    const size = readTarNumber(bytes, offset + 124, 12)
    const type = bytes[offset + 156]
    const bodyStart = offset + 512
    const bodyEnd = bodyStart + size
    if (bodyEnd > bytes.length) throw new Error('TAR entry data is truncated')
    const data = bytes.slice(bodyStart, bodyEnd)
    const typeCharacter = String.fromCharCode(type || 48)

    if (typeCharacter === 'x' || typeCharacter === 'g') {
      const attributes = parsePaxAttributes(data)
      if (typeCharacter === 'g') globalPax = { ...globalPax, ...attributes }
      else pendingPax = attributes
    } else if (typeCharacter === 'L') {
      pendingLongPath = decodeArchiveText(data).replace(/\0.*$/s, '').replace(/\n$/, '')
    } else if (typeCharacter !== 'K') {
      const attributes = { ...globalPax, ...pendingPax }
      const headerPath = prefix ? `${prefix}/${name}` : name
      const path = normalizePath(attributes.path || pendingLongPath || headerPath)
      const directory = typeCharacter === '5' || path.endsWith('/') || name.endsWith('/')
      const regularFile = typeCharacter === '0' || type === 0 || typeCharacter === '7'
      if (path && !isArchiveMetadataPath(path) && (directory || regularFile)) {
        entries.push({
          path,
          size: directory ? 0 : size,
          directory,
          data: directory ? undefined : data,
        })
      }
      pendingLongPath = ''
      pendingPax = {}
    }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  if (entries.length >= MAX_ENTRIES && offset + 512 <= bytes.length) {
    throw new Error(`Archive contains more than ${MAX_ENTRIES} entries`)
  }
  return entries
}

export function readGzipOriginalName(bytes: Uint8Array): string | undefined {
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes.length < 10) return undefined
  const flags = bytes[3] || 0
  let offset = 10
  if ((flags & 0x04) !== 0) {
    if (offset + 2 > bytes.length) return undefined
    const extraLength = (bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8)
    offset += 2 + extraLength
  }
  if ((flags & 0x08) === 0 || offset >= bytes.length) return undefined
  const end = bytes.indexOf(0, offset)
  if (end < 0) return undefined
  const name = normalizePath(decodeArchiveText(bytes.slice(offset, end)))
  return name ? baseName(name) : undefined
}

function gzipDeclaredSize(bytes: Uint8Array): number | undefined {
  if (bytes.byteLength < 4) return undefined
  const offset = bytes.byteLength - 4
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true)
}

function gunzipAsync(bytes: Uint8Array, signal: AbortSignal): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Archive operation was cancelled', 'AbortError'))
      return
    }
    let settled = false
    let terminate: () => void = () => undefined
    const onAbort = () => {
      if (settled) return
      settled = true
      terminate()
      reject(new DOMException('Archive operation was cancelled', 'AbortError'))
    }
    terminate = gunzip(bytes, { consume: true }, (error, output) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve(output)
    })
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function addImplicitDirectories(entries: ArchiveEntry[]): ArchiveEntry[] {
  const result = new Map<string, ArchiveEntry>()
  for (const entry of entries) {
    const path = normalizePath(entry.path)
    if (!path) continue
    const parts = path.split('/')
    for (let index = 1; index < parts.length; index += 1) {
      const directoryPath = parts.slice(0, index).join('/')
      if (!result.has(directoryPath)) {
        result.set(directoryPath, {
          path: directoryPath,
          size: 0,
          directory: true,
        })
      }
    }
    const existing = result.get(path)
    if (!existing || !existing.directory || entry.directory) {
      result.set(path, { ...entry, path })
    }
  }
  return [...result.values()]
}

function validateEntryBudget(
  entries: Array<Pick<ArchiveEntry, 'path' | 'size' | 'directory'>>,
  limits: ArchiveSafetyLimits,
): void {
  if (entries.length > limits.normalEntries) {
    throw new Error(`Archive contains more than ${limits.normalEntries} entries`)
  }
  let expandedSize = 0
  for (const entry of entries) {
    if (normalizePath(entry.path).split('/').length > limits.maxDepth) {
      throw new Error(`Archive path exceeds the ${limits.maxDepth}-level depth limit`)
    }
    if (!entry.directory && entry.size > limits.maxEntrySize) {
      throw new Error('Archive contains a file larger than the per-file preview limit')
    }
    expandedSize += entry.size
    if (expandedSize > limits.normalExpandedSize) {
      throw new Error('Expanded archive exceeds the normal-mode preview budget')
    }
  }
}

export function parseZipEntries(bytes: Uint8Array): ArchiveEntry[] {
  const files = unzipSync(bytes)
  const archiveEntries = Object.entries(files)
  if (archiveEntries.length > MAX_ENTRIES) {
    throw new Error(`Archive contains more than ${MAX_ENTRIES} entries`)
  }
  let expandedSize = 0
  return archiveEntries.map(([name, value]) => {
    expandedSize += value.byteLength
    if (expandedSize > MAX_OUTPUT_SIZE) {
      throw new Error('Expanded archive exceeds the default preview budget')
    }
    return {
      path: normalizePath(name),
      size: value.byteLength,
      directory: name.endsWith('/'),
      data: name.endsWith('/') ? undefined : value,
    }
  })
}

function parentPath(path: string): string {
  const index = path.lastIndexOf('/')
  return index < 0 ? '' : path.slice(0, index)
}

function baseName(path: string): string {
  return path.split('/').pop() || path
}

function extension(path: string): string {
  const name = baseName(path)
  return name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : ''
}

function mimeType(path: string): string {
  const ext = extension(path)
  const types: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    m4a: 'audio/mp4',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    mf: 'text/plain',
    properties: 'text/plain',
    ini: 'text/plain',
    cfg: 'text/plain',
    conf: 'text/plain',
  }
  return types[ext] || 'application/octet-stream'
}

function blobForEntry(entry: ArchiveEntry): Blob {
  const data = entry.data || new Uint8Array()
  const bytes = new Uint8Array(data.byteLength)
  bytes.set(data)
  return new Blob([bytes.buffer], { type: mimeType(entry.path) })
}

function createArchiveView(
  file: FileDescriptor,
  sourceEntries: ArchiveEntry[],
  outerSignal: AbortSignal,
): { root: HTMLElement, dispose: () => Promise<void> } {
  const entries = addImplicitDirectories(sourceEntries)
  const root = document.createElement('section')
  root.className = 'ufv-archive-preview ufv-archive-browser'

  const summary = document.createElement('div')
  summary.className = 'ufv-document-summary ufv-archive-summary'
  const breadcrumbs = document.createElement('nav')
  breadcrumbs.className = 'ufv-archive-breadcrumbs'
  breadcrumbs.setAttribute('aria-label', 'Archive path')

  const workspace = document.createElement('div')
  workspace.className = 'ufv-archive-workspace'
  const browser = document.createElement('div')
  browser.className = 'ufv-archive-entries'
  const preview = document.createElement('section')
  preview.className = 'ufv-archive-file-preview'
  workspace.append(browser, preview)
  root.append(summary, breadcrumbs, workspace)

  let currentPath = ''
  let selectedPath = ''
  let activeUrl = ''
  let previewToken = 0
  let nestedPreviewController: AbortController | undefined
  let extractionController: AbortController | undefined
  let loadedEntry: ArchiveEntry | undefined
  let disposeNestedPreview: (() => void | Promise<void>) | undefined

  const clearNestedPreview = async () => {
    extractionController?.abort()
    extractionController = undefined
    nestedPreviewController?.abort()
    nestedPreviewController = undefined
    const dispose = disposeNestedPreview
    disposeNestedPreview = undefined
    await dispose?.()
  }

  const revokeActiveUrl = () => {
    if (activeUrl) URL.revokeObjectURL(activeUrl)
    activeUrl = ''
  }

  const createEntryUrl = (entry: ArchiveEntry): string => {
    revokeActiveUrl()
    activeUrl = URL.createObjectURL(blobForEntry(entry))
    return activeUrl
  }

  const loadEntryData = async (
    entry: ArchiveEntry,
    signal: AbortSignal,
  ): Promise<Uint8Array> => {
    if (entry.data) return entry.data
    if (!entry.loadData) return new Uint8Array()
    const data = await entry.loadData(signal)
    if (data.byteLength > safetyLimits().maxEntrySize) {
      throw new Error('Expanded file exceeds the per-file preview limit')
    }
    entry.data = data
    return data
  }

  const renderPreview = async () => {
    const token = ++previewToken
    await clearNestedPreview()
    if (token !== previewToken) return
    revokeActiveUrl()
    preview.replaceChildren()
    const copy = labels()
    const entry = entries.find(item => item.path === selectedPath && !item.directory)
    if (loadedEntry && loadedEntry !== entry && loadedEntry.loadData) {
      loadedEntry.data = undefined
      loadedEntry = undefined
    }
    if (!entry) {
      const empty = document.createElement('div')
      empty.className = 'ufv-archive-preview-empty'
      const icon = document.createElement('span')
      icon.textContent = '◫'
      const text = document.createElement('p')
      text.textContent = copy.selectFile
      empty.append(icon, text)
      preview.append(empty)
      return
    }

    const header = document.createElement('header')
    header.className = 'ufv-archive-file-header'
    const heading = document.createElement('div')
    const eyebrow = document.createElement('span')
    eyebrow.textContent = copy.previewing
    const title = document.createElement('strong')
    title.textContent = entry.path
    heading.append(eyebrow, title)
    const download = document.createElement('a')
    download.className = 'ufv-archive-download'
    download.textContent = copy.download
    download.download = baseName(entry.path)
    download.hidden = true
    header.append(heading, download)

    const content = document.createElement('div')
    content.className = 'ufv-archive-file-content'
    const loading = document.createElement('div')
    loading.className = 'ufv-archive-preview-empty'
    const loadingIcon = document.createElement('span')
    loadingIcon.textContent = '…'
    const loadingText = document.createElement('p')
    loadingText.textContent = copy.loading
    loading.append(loadingIcon, loadingText)
    content.append(loading)
    preview.append(header, content)

    const extraction = new AbortController()
    extractionController = extraction
    let extractionTimedOut = false
    const abortExtraction = () => extraction.abort()
    outerSignal.addEventListener('abort', abortExtraction, { once: true })
    const extractionTimer = globalThis.setTimeout(() => {
      extractionTimedOut = true
      extraction.abort()
    }, safetyLimits().extractionTimeoutMs)
    try {
      await loadEntryData(entry, extraction.signal)
      globalThis.clearTimeout(extractionTimer)
      outerSignal.removeEventListener('abort', abortExtraction)
      if (extraction.signal.aborted || token !== previewToken) return
      extractionController = undefined
      if (entry.loadData) loadedEntry = entry
    } catch (error) {
      globalThis.clearTimeout(extractionTimer)
      outerSignal.removeEventListener('abort', abortExtraction)
      if ((extraction.signal.aborted && !extractionTimedOut) || token !== previewToken) return
      extractionController = undefined
      const failed = document.createElement('div')
      failed.className = 'ufv-archive-preview-empty'
      const failedIcon = document.createElement('span')
      failedIcon.textContent = '!'
      const failedText = document.createElement('p')
      const reason = extractionTimedOut
        ? copy.extractionTimeout
        : error instanceof Error ? error.message : String(error)
      failedText.textContent = `${copy.loadFailed}: ${reason}`
      failed.append(failedIcon, failedText)
      content.replaceChildren(failed)
      return
    }
    if (token !== previewToken) return

    download.href = createEntryUrl(entry)
    download.hidden = false
    content.replaceChildren()
    const ext = extension(entry.path)

    if (textExtensions.has(ext)) {
      const source = document.createElement('pre')
      source.className = 'ufv-archive-text-content'
      source.textContent = new TextDecoder().decode(entry.data)
      content.append(source)
    } else if (imageExtensions.has(ext)) {
      const image = document.createElement('img')
      image.className = 'ufv-archive-image-content'
      image.alt = baseName(entry.path)
      image.src = activeUrl
      content.append(image)
    } else if (ext === 'pdf') {
      const frame = document.createElement('iframe')
      frame.className = 'ufv-archive-pdf-content'
      frame.title = baseName(entry.path)
      frame.src = activeUrl
      content.append(frame)
    } else if (audioExtensions.has(ext) || videoExtensions.has(ext)) {
      const media = document.createElement(videoExtensions.has(ext) ? 'video' : 'audio')
      media.className = 'ufv-archive-media-content'
      media.controls = true
      media.src = activeUrl
      content.append(media)
    } else if (runtimeOptions.previewEntry) {
      const controller = new AbortController()
      nestedPreviewController = controller
      const abortNested = () => controller.abort()
      outerSignal.addEventListener('abort', abortNested, { once: true })
      try {
        const entryBlob = blobForEntry(entry)
        const nestedFile = new File([entryBlob], baseName(entry.path), {
          type: entryBlob.type,
        })
        const disposer = await runtimeOptions.previewEntry({
          file: nestedFile,
          container: content,
          signal: controller.signal,
        })
        outerSignal.removeEventListener('abort', abortNested)
        if (token !== previewToken || controller.signal.aborted) {
          await disposer?.()
          return
        }
        disposeNestedPreview = disposer || undefined
      } catch {
        outerSignal.removeEventListener('abort', abortNested)
        if (token !== previewToken || controller.signal.aborted) return
        const unavailable = document.createElement('div')
        unavailable.className = 'ufv-archive-preview-empty'
        const icon = document.createElement('span')
        icon.textContent = '⇩'
        const text = document.createElement('p')
        text.textContent = copy.unavailable
        unavailable.append(icon, text)
        content.replaceChildren(unavailable)
      }
    } else {
      const unavailable = document.createElement('div')
      unavailable.className = 'ufv-archive-preview-empty'
      const icon = document.createElement('span')
      icon.textContent = '⇩'
      const text = document.createElement('p')
      text.textContent = copy.unavailable
      unavailable.append(icon, text)
      content.append(unavailable)
    }
  }

  const renderBreadcrumbs = () => {
    breadcrumbs.replaceChildren()
    const copy = labels()
    const parts = currentPath ? currentPath.split('/') : []
    const paths = ['', ...parts.map((_, index) => parts.slice(0, index + 1).join('/'))]
    paths.forEach((path, index) => {
      if (index > 0) {
        const separator = document.createElement('span')
        separator.textContent = '/'
        separator.setAttribute('aria-hidden', 'true')
        breadcrumbs.append(separator)
      }
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.archivePath = path
      button.textContent = index === 0 ? copy.root : baseName(path)
      button.addEventListener('click', () => {
        currentPath = path
        selectedPath = ''
        render()
      })
      breadcrumbs.append(button)
    })
  }

  const renderEntries = () => {
    browser.replaceChildren()
    const copy = labels()
    const children = entries
      .filter(entry => parentPath(entry.path) === currentPath)
      .sort((first, second) => {
        if (first.directory !== second.directory) return first.directory ? -1 : 1
        return first.path.localeCompare(second.path, undefined, { numeric: true })
      })

    if (!children.length) {
      const empty = document.createElement('p')
      empty.className = 'ufv-archive-folder-empty'
      empty.textContent = copy.emptyFolder
      browser.append(empty)
      return
    }

    for (const entry of children) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'ufv-archive-entry'
      button.classList.toggle('ufv-archive-entry--selected', entry.path === selectedPath)
      button.dataset.archiveEntry = entry.path

      const icon = document.createElement('span')
      icon.className = 'ufv-archive-entry-icon'
      icon.textContent = entry.directory ? '▰' : '▤'
      const details = document.createElement('span')
      details.className = 'ufv-archive-entry-details'
      const name = document.createElement('strong')
      name.textContent = baseName(entry.path)
      const meta = document.createElement('small')
      meta.textContent = entry.directory
        ? copy.folder
        : `${copy.file} · ${entry.size.toLocaleString()} B`
      details.append(name, meta)
      const action = document.createElement('span')
      action.className = 'ufv-archive-entry-action'
      action.textContent = entry.directory ? '›' : '⌕'
      button.append(icon, details, action)

      button.addEventListener('click', () => {
        if (entry.directory) {
          currentPath = entry.path
          selectedPath = ''
          render()
        } else {
          selectedPath = entry.path
          renderEntries()
          void renderPreview()
        }
      })
      browser.append(button)
    }
  }

  const render = () => {
    const copy = labels()
    const mode = file.size > safetyLimits().normalInputSize
      ? copy.largeMode
      : copy.standardMode
    summary.textContent = `${file.name} · ${sourceEntries.length} ${copy.entries} · ${mode}`
    renderBreadcrumbs()
    renderEntries()
    void renderPreview()
  }

  const observer = new MutationObserver(render)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  })
  render()

  return {
    root,
    dispose: async () => {
      observer.disconnect()
      previewToken += 1
      await clearNestedPreview()
      revokeActiveUrl()
      if (loadedEntry?.loadData) loadedEntry.data = undefined
      loadedEntry = undefined
    },
  }
}

interface LibarchiveCompressedFile {
  name: string
  size: number
  extract(): Promise<File>
}

interface LibarchiveFileReference {
  file: LibarchiveCompressedFile
  path: string
}

interface ExtractedArchiveFile {
  name: string
  size: number
  arrayBuffer(): Promise<ArrayBuffer>
}

interface LibarchiveReader {
  getFilesArray(): Promise<LibarchiveFileReference[]>
  extractFiles(): Promise<unknown>
  hasEncryptedData(): Promise<boolean | null>
  setLocale(locale: string): Promise<void>
  close(): Promise<void>
}

interface PreparedLibarchiveWorker {
  options: { workerUrl?: string, getWorker?: () => Worker }
  dispose: () => void
}

async function prepareLibarchiveWorker(): Promise<PreparedLibarchiveWorker> {
  const workerUrl = new URL(
    runtimeOptions.workerUrl || 'libarchive/worker-bundle.js',
    document.baseURI,
  ).toString()
  if (runtimeOptions.patchWorker === false) {
    return { options: { workerUrl }, dispose: () => undefined }
  }

  const response = await fetch(workerUrl)
  if (!response.ok) throw new Error(`Unable to load archive worker: ${response.status}`)
  const originalSource = await response.text()
  const typePattern = /type:\s*([A-Za-z_$][\w$]*)\[this\._runCode\.getEntryType\(([^)]+)\)\](?!\s*\|\|)/
  if (!typePattern.test(originalSource)) {
    // The hosted worker is already repaired or belongs to a newer version.
    return { options: { workerUrl }, dispose: () => undefined }
  }

  const wasmUrl = runtimeOptions.wasmUrl
    || new URL('libarchive.wasm', workerUrl).toString()
  let patchedSource = originalSource.replace(
    typePattern,
    'type:$1[this._runCode.getEntryType($2)]||"FILE"',
  )
  const relativeWasmPattern = /new URL\(\s*["'][^"']*libarchive\.wasm["']\s*,\s*import\.meta\.url\s*\)\.href/g
  if (!relativeWasmPattern.test(patchedSource)) {
    throw new Error('Unable to locate libarchive.wasm reference in archive worker')
  }
  patchedSource = patchedSource.replace(relativeWasmPattern, JSON.stringify(wasmUrl))
  const blobUrl = URL.createObjectURL(new Blob([patchedSource], { type: 'text/javascript' }))
  return {
    options: { getWorker: () => new Worker(blobUrl, { type: 'module' }) },
    dispose: () => URL.revokeObjectURL(blobUrl),
  }
}

function flattenExtractedFiles(
  value: unknown,
  prefix = '',
  result: Array<{ path: string, file: ExtractedArchiveFile }> = [],
): Array<{ path: string, file: ExtractedArchiveFile }> {
  const candidate = value as {
    name?: unknown
    size?: unknown
    arrayBuffer?: unknown
  } | null
  if (
    value
    && typeof value === 'object'
    && typeof candidate?.size === 'number'
    && typeof candidate.arrayBuffer === 'function'
  ) {
    const name = typeof candidate.name === 'string' && candidate.name
      ? candidate.name
      : baseName(prefix)
    if (!name) return result
    result.push({
      path: normalizePath(prefix || name),
      file: {
        name,
        size: candidate.size,
        arrayBuffer: () => (candidate.arrayBuffer as () => Promise<ArrayBuffer>).call(value),
      },
    })
    return result
  }
  if (!value || typeof value !== 'object') return result
  for (const [name, child] of Object.entries(value)) {
    const nextPrefix = name === '.'
      ? prefix
      : prefix
        ? `${prefix}/${name}`
        : name
    flattenExtractedFiles(child, nextPrefix, result)
  }
  return result
}

async function listLibarchiveEntries(
  file: FileDescriptor,
  signal: AbortSignal,
  limits: ArchiveSafetyLimits,
): Promise<ArchiveListing> {
  const assertActive = () => {
    if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
  }
  const { Archive } = await import('libarchive.js')
  const worker = await prepareLibarchiveWorker()
  Archive.init(worker.options)
  const archiveFile = file.blob instanceof File
    ? file.blob
    : new File([file.blob], file.name, { type: file.mimeType })
  let reader: LibarchiveReader
  try {
    reader = await Archive.open(archiveFile) as unknown as LibarchiveReader
  } catch (error) {
    worker.dispose()
    throw error
  }
  try {
    assertActive()
    try { await reader.setLocale('zh_CN.UTF-8') } catch { /* use library default */ }
    assertActive()
    const encrypted = await reader.hasEncryptedData()
    assertActive()
    if (encrypted) {
      throw new Error('Password-protected RAR/7Z archives require a password and cannot be opened yet')
    }
    let files = await reader.getFilesArray()
    assertActive()
    if (!files.length) {
      // libarchive reports regular RAR files through getFilesArray(), but
      // some 7Z headers expose their type differently. Its full extraction
      // API still returns the complete nested tree, so use it as a 7Z-only
      // compatibility fallback.
      const extractedTree = await reader.extractFiles()
      assertActive()
      const extracted = flattenExtractedFiles(extractedTree)
      files = extracted.map(item => ({
        path: '',
        file: {
          name: item.path,
          size: item.file.size,
          extract: async () => new File([
            await item.file.arrayBuffer(),
          ], item.file.name, { type: 'application/octet-stream' }),
        },
      }))
    }
    if (files.length > limits.normalEntries) {
      throw new Error(`Archive contains more than ${limits.normalEntries} entries`)
    }
    const expandedSize = files.reduce((total, item) => total + item.file.size, 0)
    if (expandedSize > limits.normalExpandedSize) {
      throw new Error('Expanded archive exceeds the normal-mode preview budget')
    }
    if (
      expandedSize > 1024 * 1024
      && expandedSize / Math.max(1, file.size) > limits.maxCompressionRatio
    ) {
      throw new Error('Archive has an unsafe compression ratio')
    }
    validateEntryBudget(files.map(item => ({
      path: item.path ? `${item.path}/${item.file.name}` : item.file.name,
      size: item.file.size,
      directory: false,
    })), limits)
    const entries = files.map((item): ArchiveEntry => {
      const path = normalizePath(item.path
        ? `${item.path}/${item.file.name}`
        : item.file.name)
      return {
        path,
        size: item.file.size,
        directory: false,
        loadData: async (entrySignal) => {
          if (entrySignal.aborted) {
            throw new DOMException('Archive operation was cancelled', 'AbortError')
          }
          const extracted = await item.file.extract()
          const data = new Uint8Array(await extracted.arrayBuffer())
          if (entrySignal.aborted) {
            throw new DOMException('Archive operation was cancelled', 'AbortError')
          }
          return data
        },
      }
    })
    return {
      entries,
      dispose: async () => {
        await reader.close()
        worker.dispose()
      },
    }
  } catch (error) {
    await reader.close()
    worker.dispose()
    throw error
  }
}

async function listEntries(file: FileDescriptor, signal: AbortSignal): Promise<ArchiveListing> {
  const limits = safetyLimits()
  const zip = file.extension === 'zip'
    || file.extension === 'jar'
    || ['application/zip', 'application/java-archive'].includes(file.mimeType)

  if (zip) {
    if (file.size > limits.largeZipInputSize) {
      throw new Error('ZIP/JAR exceeds the 1 GB large-file preview limit')
    }
    const safety = zipSafetyLimits(file)
    const entries = await readZipDirectory(file, signal, safety)
    return {
      entries: entries.map(entry => ({
        path: entry.path,
        size: entry.size,
        directory: entry.directory,
        loadData: entry.directory
          ? undefined
          : entrySignal => readZipEntry(file, entry, entrySignal, safety.maxEntrySize),
      })),
      dispose: () => undefined,
    }
  }

  if (file.size > limits.normalInputSize) {
    throw new Error('This archive format exceeds the 100 MB browser preview limit')
  }
  if (
    file.extension === 'rar'
    || file.extension === '7z'
    || ['application/vnd.rar', 'application/x-rar-compressed', 'application/x-7z-compressed']
      .includes(file.mimeType)
  ) {
    return listLibarchiveEntries(file, signal, limits)
  }
  const bytes = new Uint8Array(await file.blob.arrayBuffer())
  if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')

  if (file.extension === 'tar' || file.mimeType === 'application/x-tar') {
    const entries = parseTarEntries(bytes)
    validateEntryBudget(entries, limits)
    return { entries, dispose: () => undefined }
  }
  if (
    file.extension === 'gz'
    || file.extension === 'gzip'
    || file.extension === 'tgz'
    || file.mimeType === 'application/gzip'
    || file.mimeType === 'application/x-gzip'
  ) {
    const expectedSize = gzipDeclaredSize(bytes)
    if (expectedSize !== undefined) {
      if (expectedSize > limits.normalExpandedSize) {
        throw new Error('Expanded archive exceeds the normal-mode preview budget')
      }
      if (
        expectedSize > 1024 * 1024
        && expectedSize / Math.max(1, file.size) > limits.maxCompressionRatio
      ) {
        throw new Error('Archive has an unsafe compression ratio')
      }
    }
    const unpacked = await gunzipAsync(bytes, signal)
    if (unpacked.byteLength > limits.normalExpandedSize) {
      throw new Error('Expanded archive exceeds the normal-mode preview budget')
    }
    const tarEntries = parseTarEntries(unpacked)
    validateEntryBudget(tarEntries, limits)
    if (!tarEntries.length && unpacked.byteLength > limits.maxEntrySize) {
      throw new Error('Expanded file exceeds the per-file preview limit')
    }
    return {
      entries: tarEntries.length
        ? tarEntries
        : [{
          path: readGzipOriginalName(bytes)
            || file.name.replace(/\.(?:gz|gzip|tgz)$/i, '')
            || 'decompressed-file',
          size: unpacked.byteLength,
          directory: false,
          data: unpacked,
        }],
      dispose: () => undefined,
    }
  }

  return { entries: parseZipEntries(bytes), dispose: () => undefined }
}

export const archiveAdapter: PreviewAdapter = {
  id: 'archive',
  label: 'Archive browser',
  supports: supportsArchive,
  async open(file, signal): Promise<PreviewSession> {
    const limits = safetyLimits()
    const listing = await withOperationTimeout(
      signal,
      limits.directoryTimeoutMs,
      'Archive directory reading timed out',
      operationSignal => listEntries(file, operationSignal),
    )
    let root: HTMLElement | undefined
    let disposeView: (() => void | Promise<void>) | undefined
    return {
      adapterId: 'archive',
      adapterLabel: 'Archive browser',
      capabilities: ['preview', 'download', 'select-text', 'copy'],
      mount(container) {
        const view = createArchiveView(file, listing.entries, signal)
        root = view.root
        disposeView = view.dispose
        container.replaceChildren(root)
      },
      async dispose() {
        await disposeView?.()
        disposeView = undefined
        root?.remove()
        root = undefined
        await listing.dispose()
      },
    }
  },
}

export const archiveAdapterManifest = {
  id: 'archive',
  extensions: [...archiveExtensions],
  mimeTypes: [
    'application/zip',
    'application/java-archive',
    'application/gzip',
    'application/x-gzip',
    'application/x-tar',
    'application/vnd.rar',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
  load: async () => archiveAdapter,
}
