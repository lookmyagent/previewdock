import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@universal-file-viewer/core'
import { strFromU8, unzipSync } from 'fflate'

type OfficeKind = 'document' | 'spreadsheet' | 'presentation'
type ZipFiles = Record<string, Uint8Array>

const documentExtensions = new Set(['docx', 'docm', 'dotx', 'dotm'])
const spreadsheetExtensions = new Set(['xlsx', 'xlsm', 'xltx', 'xltm', 'xlam'])
const presentationExtensions = new Set(['pptx', 'pptm', 'potx', 'potm', 'ppsx', 'ppsm'])
const allExtensions = new Set([
  ...documentExtensions,
  ...spreadsheetExtensions,
  ...presentationExtensions,
])

const MAX_INPUT_SIZE = 25 * 1024 * 1024
const MAX_XML_SIZE = 50 * 1024 * 1024
const MAX_SHEETS = 20
const MAX_ROWS = 500
const MAX_COLUMNS = 100

function officeKind(file: FileDescriptor): OfficeKind | undefined {
  if (documentExtensions.has(file.extension)) return 'document'
  if (spreadsheetExtensions.has(file.extension)) return 'spreadsheet'
  if (presentationExtensions.has(file.extension)) return 'presentation'
  return undefined
}

function parseXml(value: Uint8Array | undefined, name: string): XMLDocument {
  if (!value) throw new Error(`OpenXML part is missing: ${name}`)
  const document = new DOMParser().parseFromString(strFromU8(value), 'application/xml')
  if (document.querySelector('parsererror')) {
    throw new Error(`Unable to parse OpenXML part: ${name}`)
  }
  return document
}

function textFromNodes(parent: Element, localName = 't'): string {
  return [...parent.getElementsByTagNameNS('*', localName)]
    .map(node => node.textContent || '')
    .join('')
}

function createFallbackRoot(file: FileDescriptor, kind: OfficeKind): HTMLElement {
  const root = document.createElement('article')
  root.className = `ufv-office-preview ufv-office-preview--${kind} ufv-office-fallback`
  const summary = document.createElement('div')
  summary.className = 'ufv-document-summary'
  summary.textContent = `${file.name} · Simplified content view`
  root.append(summary)
  return root
}

function renderDocumentFallback(files: ZipFiles, root: HTMLElement): void {
  const xml = parseXml(files['word/document.xml'], 'word/document.xml')
  const paragraphs = [...xml.getElementsByTagNameNS('*', 'p')]
  for (const paragraph of paragraphs.slice(0, 3000)) {
    const text = [...paragraph.getElementsByTagNameNS('*', 't')]
      .map(node => node.textContent || '')
      .join('')
    if (!text.trim()) continue
    const element = document.createElement('p')
    element.textContent = text
    root.append(element)
  }
}

function columnIndex(reference: string): number {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() || 'A'
  let value = 0
  for (const letter of letters) value = value * 26 + letter.charCodeAt(0) - 64
  return Math.max(0, value - 1)
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

function spreadsheetParts(files: ZipFiles): Array<{ name: string, path: string }> {
  const fallback = Object.keys(files)
    .filter(name => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((path, index) => ({ name: `Sheet ${index + 1}`, path }))

  if (!files['xl/workbook.xml'] || !files['xl/_rels/workbook.xml.rels']) return fallback

  try {
    const workbook = parseXml(files['xl/workbook.xml'], 'xl/workbook.xml')
    const relationships = parseXml(
      files['xl/_rels/workbook.xml.rels'],
      'xl/_rels/workbook.xml.rels',
    )
    const targets = new Map(
      [...relationships.getElementsByTagNameNS('*', 'Relationship')].map(relationship => [
        relationship.getAttribute('Id') || '',
        relationship.getAttribute('Target') || '',
      ]),
    )

    const sheets = [...workbook.getElementsByTagNameNS('*', 'sheet')]
      .map((sheet, index) => {
        const relationshipId = sheet.getAttributeNS(
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          'id',
        ) || sheet.getAttribute('r:id') || ''
        const target = targets.get(relationshipId)?.replace(/^\/?xl\//, '') || ''
        return {
          name: sheet.getAttribute('name') || `Sheet ${index + 1}`,
          path: `xl/${target.replace(/^\/+/, '')}`,
        }
      })
      .filter(sheet => files[sheet.path])
    return sheets.length ? sheets : fallback
  } catch {
    return fallback
  }
}

function spreadsheetCellValue(cell: Element, sharedStrings: string[]): string {
  const type = cell.getAttribute('t')
  const raw = cell.getElementsByTagNameNS('*', 'v')[0]?.textContent || ''
  if (type === 's') return sharedStrings[Number(raw)] || ''
  if (type === 'inlineStr') return textFromNodes(cell)
  if (type === 'b') return raw === '1' ? 'TRUE' : 'FALSE'
  return raw || textFromNodes(cell)
}

function renderSpreadsheet(files: ZipFiles, file: FileDescriptor): HTMLElement {
  const root = document.createElement('section')
  root.className = 'ufv-sheet-preview'

  const toolbar = document.createElement('header')
  toolbar.className = 'ufv-sheet-toolbar'
  const title = document.createElement('strong')
  title.textContent = file.name
  const badge = document.createElement('span')
  badge.textContent = 'Read-only'
  toolbar.append(title, badge)

  const sharedXml = files['xl/sharedStrings.xml']
  const sharedStrings = sharedXml
    ? [...parseXml(sharedXml, 'xl/sharedStrings.xml').getElementsByTagNameNS('*', 'si')]
      .map(node => [...node.getElementsByTagNameNS('*', 't')].map(text => text.textContent || '').join(''))
    : []
  const sheets = spreadsheetParts(files).slice(0, MAX_SHEETS)
  const stage = document.createElement('div')
  stage.className = 'ufv-sheet-stage'
  const tabs = document.createElement('div')
  tabs.className = 'ufv-sheet-tabs'
  tabs.setAttribute('role', 'tablist')

  sheets.forEach((sheet, sheetIndex) => {
    const xml = parseXml(files[sheet.path], sheet.path)
    const rows = [...xml.getElementsByTagNameNS('*', 'row')].slice(0, MAX_ROWS)
    const maxColumn = Math.min(
      MAX_COLUMNS,
      Math.max(
        1,
        ...rows.flatMap(row => [...row.getElementsByTagNameNS('*', 'c')]
          .map(cell => columnIndex(cell.getAttribute('r') || 'A1') + 1)),
      ),
    )
    const panelId = `ufv-sheet-${sheetIndex}-${Math.random().toString(36).slice(2)}`
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
    for (let index = 0; index < maxColumn; index += 1) {
      const heading = document.createElement('th')
      heading.scope = 'col'
      heading.textContent = columnLabel(index)
      headingRow.append(heading)
    }
    head.append(headingRow)

    const body = document.createElement('tbody')
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr')
      const rowHeading = document.createElement('th')
      rowHeading.scope = 'row'
      rowHeading.textContent = row.getAttribute('r') || String(rowIndex + 1)
      tr.append(rowHeading)
      const values = new Map<number, string>()
      for (const cell of [...row.getElementsByTagNameNS('*', 'c')].slice(0, MAX_COLUMNS)) {
        values.set(
          columnIndex(cell.getAttribute('r') || `A${rowIndex + 1}`),
          spreadsheetCellValue(cell, sharedStrings),
        )
      }
      for (let column = 0; column < maxColumn; column += 1) {
        const td = document.createElement('td')
        td.textContent = values.get(column) || ''
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
    tab.textContent = sheet.name
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

  if (!sheets.length) {
    const empty = document.createElement('p')
    empty.className = 'ufv-office-empty'
    empty.textContent = 'No worksheets were found in this workbook.'
    stage.append(empty)
  }

  root.append(toolbar, stage, tabs)
  return root
}

function renderPresentationFallback(files: ZipFiles, root: HTMLElement): void {
  const slideNames = Object.keys(files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  for (const [index, name] of slideNames.slice(0, 300).entries()) {
    const slide = document.createElement('section')
    slide.className = 'ufv-office-slide'
    const heading = document.createElement('h2')
    heading.textContent = `Slide ${index + 1}`
    slide.append(heading)
    const xml = parseXml(files[name], name)
    const lines = [...xml.getElementsByTagNameNS('*', 'p')]
      .map(node => [...node.getElementsByTagNameNS('*', 't')].map(text => text.textContent || '').join(''))
      .filter(Boolean)
    for (const line of lines) {
      const paragraph = document.createElement('p')
      paragraph.textContent = line
      slide.append(paragraph)
    }
    root.append(slide)
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
}

export const openXmlAdapter: PreviewAdapter = {
  id: 'openxml',
  label: 'High-fidelity Office preview',
  supports: file => allExtensions.has(file.extension),
  async open(file, signal): Promise<PreviewSession> {
    const kind = officeKind(file)
    if (!kind) throw new Error('Unsupported OpenXML format')
    if (file.size > MAX_INPUT_SIZE) {
      throw new Error('Office document exceeds the 25 MB browser preview limit')
    }
    const bytes = new Uint8Array(await file.blob.arrayBuffer())
    throwIfAborted(signal)
    const files = unzipSync(bytes)
    const xmlSize = Object.entries(files)
      .filter(([name]) => name.endsWith('.xml'))
      .reduce((total, [, value]) => total + value.byteLength, 0)
    if (xmlSize > MAX_XML_SIZE) {
      throw new Error('Expanded Office XML exceeds the 50 MB preview limit')
    }

    let root: HTMLElement | undefined
    let destroyPresentation: (() => void) | undefined
    return {
      adapterId: 'openxml',
      adapterLabel: 'High-fidelity Office preview',
      capabilities: ['preview', 'select-text', 'copy'],
      async mount(container, mountSignal) {
        throwIfAborted(mountSignal)

        if (kind === 'spreadsheet') {
          root = renderSpreadsheet(files, file)
          container.replaceChildren(root)
          return
        }

        if (kind === 'document') {
          root = document.createElement('section')
          root.className = 'ufv-docx-preview'
          const body = document.createElement('div')
          body.className = 'ufv-docx-preview__body'
          root.append(body)
          container.replaceChildren(root)
          try {
            const { renderAsync } = await import('docx-preview')
            throwIfAborted(mountSignal)
            await renderAsync(file.blob, body, undefined, {
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
              throw new Error('The document renderer returned no pages')
            }
            throwIfAborted(mountSignal)
          } catch (error) {
            if (mountSignal.aborted) throw error
            root = createFallbackRoot(file, kind)
            renderDocumentFallback(files, root)
            container.replaceChildren(root)
          }
          return
        }

        root = document.createElement('section')
        root.className = 'ufv-pptx-preview'
        const stage = document.createElement('div')
        stage.className = 'ufv-pptx-preview__stage'
        root.append(stage)
        container.replaceChildren(root)
        try {
          const { PptxViewer, RECOMMENDED_ZIP_LIMITS } = await import(
            '@aiden0z/pptx-renderer/browser'
          )
          throwIfAborted(mountSignal)
          const viewer = await PptxViewer.open(file.blob, stage, {
            fitMode: 'contain',
            scrollContainer: container,
            zipLimits: RECOMMENDED_ZIP_LIMITS,
            lazySlides: true,
            lazyMedia: true,
            renderMode: 'list',
            listOptions: {
              windowed: true,
              initialSlides: 4,
              batchSize: 4,
              showSlideLabels: true,
            },
            pdfjs: false,
            signal: mountSignal,
          })
          if (viewer.slideCount === 0) {
            viewer.destroy()
            throw new Error('The presentation renderer returned no slides')
          }
          destroyPresentation = () => viewer.destroy()
          throwIfAborted(mountSignal)
        } catch (error) {
          if (mountSignal.aborted) throw error
          root = createFallbackRoot(file, kind)
          renderPresentationFallback(files, root)
          container.replaceChildren(root)
        }
      },
      dispose() {
        destroyPresentation?.()
        destroyPresentation = undefined
        root?.remove()
        root = undefined
      },
    }
  },
}

export const openXmlAdapterManifest = {
  id: 'openxml',
  extensions: [...allExtensions],
  mimeTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  load: async () => openXmlAdapter,
}
