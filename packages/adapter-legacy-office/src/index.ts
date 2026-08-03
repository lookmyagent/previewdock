import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'

const spreadsheetExtensions = new Set(['xls', 'xlt', 'xla', 'et', 'ett'])
const documentExtensions = new Set(['doc', 'dot', 'wps', 'wpt', 'ott'])
const presentationExtensions = new Set(['ppt', 'dps', 'otp'])
const drawingExtensions = new Set(['vsd', 'wmf', 'emf'])
const convertedExtensions = new Set([
  ...documentExtensions,
  ...presentationExtensions,
  ...drawingExtensions,
])
const allExtensions = new Set([
  ...spreadsheetExtensions,
  ...convertedExtensions,
])
const MAX_INPUT_SIZE = 30 * 1024 * 1024
const MAX_SHEETS = 20
const MAX_ROWS = 500
const MAX_COLUMNS = 100

export interface LegacyOfficeConversionRequest {
  blob: Blob
  name: string
  extension: string
  kind: 'document' | 'presentation' | 'drawing'
  target: 'docx' | 'pdf'
  signal: AbortSignal
  onProgress: (progress: number, message?: string) => void
}

export interface LegacyOfficePdfConverter {
  id: string
  convert(request: LegacyOfficeConversionRequest): Promise<Blob>
}

export interface LegacyOfficeAdapterOptions {
  converter?: LegacyOfficePdfConverter
}

let configuredConverter: LegacyOfficePdfConverter | undefined

export function configureLegacyOfficeConverter(
  converter?: LegacyOfficePdfConverter,
): () => void {
  const previous = configuredConverter
  configuredConverter = converter
  return () => {
    configuredConverter = previous
  }
}

function isChinese(): boolean {
  return document.documentElement.lang.toLowerCase().startsWith('zh')
}

function columnLabel(index: number): string {
  let value = index + 1
  let label = ''
  while (value > 0) {
    value -= 1
    label = String.fromCharCode(65 + (value % 26)) + label
    value = Math.floor(value / 26)
  }
  return label
}

function renderWorkbook(
  file: FileDescriptor,
  workbook: import('xlsx').WorkBook,
  XLSX: typeof import('xlsx'),
): { root: HTMLElement, dispose: () => void } {
  const root = document.createElement('section')
  root.className = 'ufv-sheet-preview ufv-sheet-preview--legacy'
  const toolbar = document.createElement('header')
  toolbar.className = 'ufv-sheet-toolbar'
  const title = document.createElement('strong')
  title.textContent = file.name
  const badge = document.createElement('span')
  toolbar.append(title, badge)
  const stage = document.createElement('div')
  stage.className = 'ufv-sheet-stage'
  const tabs = document.createElement('div')
  tabs.className = 'ufv-sheet-tabs'
  tabs.setAttribute('role', 'tablist')

  const sheetNames = workbook.SheetNames.slice(0, MAX_SHEETS)
  sheetNames.forEach((sheetName, sheetIndex) => {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) return
    let range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')
    range = {
      s: range.s,
      e: {
        r: Math.min(range.e.r, range.s.r + MAX_ROWS - 1),
        c: Math.min(range.e.c, range.s.c + MAX_COLUMNS - 1),
      },
    }
    const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean>>(
      sheet,
      {
        header: 1,
        raw: false,
        defval: '',
        blankrows: true,
        range,
      },
    )
    const columnCount = Math.max(
      1,
      Math.min(
        MAX_COLUMNS,
        range.e.c - range.s.c + 1,
        ...rows.map(row => row.length),
      ),
    )
    const panelId = `ufv-legacy-sheet-${sheetIndex}-${Math.random().toString(36).slice(2)}`
    const panel = document.createElement('div')
    panel.id = panelId
    panel.className = 'ufv-sheet-panel'
    panel.setAttribute('role', 'tabpanel')
    panel.hidden = sheetIndex !== 0
    const table = document.createElement('table')
    const head = document.createElement('thead')
    const headingRow = document.createElement('tr')
    const corner = document.createElement('th')
    corner.className = 'ufv-sheet-corner'
    corner.setAttribute('aria-label', 'Row and column headers')
    headingRow.append(corner)
    for (let column = 0; column < columnCount; column += 1) {
      const heading = document.createElement('th')
      heading.scope = 'col'
      heading.textContent = columnLabel(range.s.c + column)
      headingRow.append(heading)
    }
    head.append(headingRow)
    const body = document.createElement('tbody')
    rows.slice(0, MAX_ROWS).forEach((row, rowIndex) => {
      const tr = document.createElement('tr')
      const rowHeading = document.createElement('th')
      rowHeading.scope = 'row'
      rowHeading.textContent = String(range.s.r + rowIndex + 1)
      tr.append(rowHeading)
      for (let column = 0; column < columnCount; column += 1) {
        const td = document.createElement('td')
        const value = row[column]
        td.textContent = value === undefined || value === null ? '' : String(value)
        tr.append(td)
      }
      body.append(tr)
    })
    table.append(head, body)
    panel.append(table)
    stage.append(panel)

    const tab = document.createElement('button')
    tab.type = 'button'
    tab.className = 'ufv-sheet-tab'
    tab.textContent = sheetName
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', panelId)
    tab.setAttribute('aria-selected', String(sheetIndex === 0))
    tab.addEventListener('click', () => {
      for (const button of tabs.querySelectorAll<HTMLElement>('[role="tab"]')) {
        button.setAttribute('aria-selected', String(button === tab))
      }
      for (const sheetPanel of stage.querySelectorAll<HTMLElement>('[role="tabpanel"]')) {
        sheetPanel.hidden = sheetPanel !== panel
      }
    })
    tabs.append(tab)
  })

  if (!sheetNames.length) {
    const empty = document.createElement('p')
    empty.className = 'ufv-office-empty'
    empty.textContent = isChinese() ? '工作簿中没有工作表。' : 'No worksheets were found.'
    stage.append(empty)
  }

  const updateLabels = () => {
    badge.textContent = isChinese() ? '旧版 Excel · 只读' : 'Legacy Excel · Read-only'
  }
  updateLabels()
  const languageObserver = new MutationObserver(updateLabels)
  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  })
  root.append(toolbar, stage, tabs)
  return { root, dispose: () => languageObserver.disconnect() }
}

async function openSpreadsheet(
  file: FileDescriptor,
  signal: AbortSignal,
): Promise<PreviewSession> {
  const XLSX = await import('xlsx')
  const bytes = await file.blob.arrayBuffer()
  if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
  const workbook = XLSX.read(bytes, {
    type: 'array',
    cellDates: true,
    cellFormula: true,
    cellStyles: false,
    dense: false,
  })
  let root: HTMLElement | undefined
  let disposeView: (() => void) | undefined
  return {
    adapterId: 'legacy-office',
    adapterLabel: 'Legacy Excel workbook preview',
    capabilities: ['preview', 'select-text', 'copy'],
    mount(container, mountSignal) {
      if (mountSignal.aborted) {
        throw new DOMException('Preview was cancelled', 'AbortError')
      }
      const view = renderWorkbook(file, workbook, XLSX)
      root = view.root
      disposeView = view.dispose
      container.replaceChildren(root)
    },
    dispose() {
      disposeView?.()
      disposeView = undefined
      root?.remove()
      root = undefined
    },
  }
}

async function openConvertedDocument(
  file: FileDescriptor,
  converter: LegacyOfficePdfConverter | undefined,
): Promise<PreviewSession> {
  if (!converter) {
    throw new Error(isChinese()
      ? 'DOC/PPT 需要可选的 LibreOffice WASM 转 PDF 运行时；请通过 configureLegacyOfficeConverter() 配置。'
      : 'DOC/PPT preview requires an optional LibreOffice WASM PDF converter. '
        + 'Configure it with configureLegacyOfficeConverter().')
  }
  let root: HTMLElement | undefined
  let objectUrl: string | undefined
  const kind = documentExtensions.has(file.extension)
    ? 'document'
    : presentationExtensions.has(file.extension) ? 'presentation' : 'drawing'
  const target = kind === 'document' ? 'docx' : 'pdf'
  return {
    adapterId: 'legacy-office',
    adapterLabel: `Legacy Office via ${converter.id}`,
    capabilities: target === 'docx'
      ? ['preview', 'pages', 'select-text', 'copy']
      : ['preview', 'pages', 'print'],
    async mount(container, signal) {
      root = document.createElement('section')
      root.className = 'ufv-legacy-conversion'
      const status = document.createElement('div')
      status.className = 'ufv-legacy-conversion-status'
      const title = document.createElement('strong')
      title.textContent = file.name
      const message = document.createElement('span')
      const progress = document.createElement('progress')
      progress.max = 100
      progress.value = 0
      status.append(title, message, progress)
      root.append(status)
      container.replaceChildren(root)
      const updateMessage = (value: number, detail?: string) => {
        const percent = Math.max(0, Math.min(100, Math.round(value)))
        progress.value = percent
        message.textContent = detail || (isChinese()
          ? `正在浏览器内转换… ${percent}%`
          : `Converting in the browser… ${percent}%`)
      }
      updateMessage(0)
      const converted = await converter.convert({
        blob: file.blob,
        name: file.name,
        extension: file.extension,
        kind,
        target,
        signal,
        onProgress: updateMessage,
      })
      if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')

      if (target === 'docx') {
        root.className = 'ufv-docx-preview ufv-legacy-docx-preview'
        const body = document.createElement('div')
        body.className = 'ufv-docx-preview__body'
        root.replaceChildren(body)
        const { renderAsync } = await import('docx-preview')
        if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
        await renderAsync(converted, body, undefined, {
          inWrapper: true,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          renderChanges: true,
          renderComments: true,
          renderAltChunks: false,
          ignoreLastRenderedPageBreak: false,
          experimental: true,
          useBase64URL: true,
          debug: false,
        })
        if (!body.querySelector('section.docx')) {
          throw new Error('The converted DOCX renderer returned no pages')
        }
        return
      }

      if (converted.type && converted.type !== 'application/pdf') {
        throw new Error('Legacy Office converter did not return a PDF document')
      }
      objectUrl = URL.createObjectURL(converted)
      const frame = document.createElement('iframe')
      frame.className = 'ufv-pdf-preview'
      frame.title = file.name
      frame.src = objectUrl
      root.replaceChildren(frame)
    },
    dispose() {
      root?.remove()
      root = undefined
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      objectUrl = undefined
    },
  }
}

export function createLegacyOfficeAdapter(
  options: LegacyOfficeAdapterOptions = {},
): PreviewAdapter {
  return {
    id: 'legacy-office',
    label: 'Legacy Office preview',
    supports: file => allExtensions.has(file.extension),
    async open(file, signal) {
      if (file.size > MAX_INPUT_SIZE) {
        throw new Error('Legacy Office file exceeds the 30 MB browser preview limit')
      }
      if (spreadsheetExtensions.has(file.extension)) {
        return openSpreadsheet(file, signal)
      }
      return openConvertedDocument(file, options.converter || configuredConverter)
    },
  }
}

export const legacyOfficeAdapter = createLegacyOfficeAdapter()

export const legacyOfficeAdapterManifest = {
  id: 'legacy-office',
  extensions: [...allExtensions],
  mimeTypes: [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.ms-works',
    'application/vnd.ms-wpl',
  ],
  load: async () => legacyOfficeAdapter,
}
