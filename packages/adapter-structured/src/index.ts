import type {
  FileDescriptor,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'
import { strFromU8, unzipSync } from 'fflate'

type ZipFiles = Record<string, Uint8Array>

const extensions = new Set([
  'bpmn', 'xmind', 'eml', 'epub', 'rtf',
  'odt', 'ods', 'ots', 'odp', 'otp', 'ott', 'fodt', 'fods',
  'ofd', 'vsdx',
])
const MAX_INPUT_SIZE = 30 * 1024 * 1024
const SVG_NS = 'http://www.w3.org/2000/svg'
const odfZipExtensions = new Set(['odt', 'ods', 'ots', 'odp', 'otp', 'ott'])

function isChinese(): boolean {
  return document.documentElement.lang.toLowerCase().startsWith('zh')
}

function parseXml(source: string, label: string): XMLDocument {
  const xml = new DOMParser().parseFromString(source, 'application/xml')
  if (xml.querySelector('parsererror')) throw new Error(`Unable to parse ${label}`)
  return xml
}

function parseHtml(source: string): Document {
  return new DOMParser().parseFromString(source, 'text/html')
}

function unzip(bytes: Uint8Array): ZipFiles {
  try {
    return unzipSync(bytes)
  } catch {
    throw new Error(isChinese() ? '文件不是有效的 ZIP 容器。' : 'The file is not a valid ZIP container.')
  }
}

function xmlPart(files: ZipFiles, path: string): XMLDocument {
  const value = files[path]
  if (!value) throw new Error(`Archive part is missing: ${path}`)
  return parseXml(strFromU8(value), path)
}

function element(name: string, className?: string): HTMLElement {
  const node = document.createElement(name)
  if (className) node.className = className
  return node
}

function shell(file: FileDescriptor, kind: string, subtitle: string): {
  root: HTMLElement
  content: HTMLElement
} {
  const root = element('section', `ufv-structured ufv-structured--${kind}`)
  const toolbar = element('header', 'ufv-structured-toolbar')
  const title = element('strong')
  title.textContent = file.name
  const badge = element('span')
  badge.textContent = subtitle
  toolbar.append(title, badge)
  const content = element('div', 'ufv-structured-content')
  root.append(toolbar, content)
  return { root, content }
}

function localElements(parent: ParentNode, names: string[]): Element[] {
  const wanted = new Set(names)
  return [...parent.querySelectorAll('*')].filter(node => wanted.has(node.localName))
}

function directChildren(parent: Element, localName: string): Element[] {
  return [...parent.children].filter(child => child.localName === localName)
}

function svgElement<K extends keyof SVGElementTagNameMap>(name: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, name)
}

function svgText(
  svg: SVGSVGElement,
  value: string,
  x: number,
  y: number,
  maxWidth = 140,
): void {
  const text = svgElement('text')
  text.setAttribute('x', String(x))
  text.setAttribute('y', String(y))
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('class', 'ufv-diagram-label')
  const maxCharacters = Math.max(5, Math.floor(maxWidth / 13))
  const lines: string[] = []
  let remainder = value.trim()
  while (remainder.length > maxCharacters && lines.length < 3) {
    let split = remainder.lastIndexOf(' ', maxCharacters)
    if (split < maxCharacters / 2) split = maxCharacters
    lines.push(remainder.slice(0, split))
    remainder = remainder.slice(split).trim()
  }
  if (remainder) lines.push(remainder)
  const offset = -((lines.length - 1) * 8)
  lines.slice(0, 4).forEach((line, index) => {
    const span = svgElement('tspan')
    span.setAttribute('x', String(x))
    span.setAttribute('dy', index === 0 ? String(offset) : '16')
    span.textContent = line
    text.append(span)
  })
  svg.append(text)
}

function renderBpmn(source: string, file: FileDescriptor): HTMLElement {
  const xml = parseXml(source, file.name)
  const { root, content } = shell(file, 'diagram', isChinese() ? 'BPMN 工作流' : 'BPMN workflow')
  const canvas = element('div', 'ufv-diagram-canvas')
  const svg = svgElement('svg')
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', file.name)

  const definitions = svgElement('defs')
  const marker = svgElement('marker')
  marker.id = `ufv-arrow-${Math.random().toString(36).slice(2)}`
  marker.setAttribute('viewBox', '0 0 10 10')
  marker.setAttribute('refX', '9')
  marker.setAttribute('refY', '5')
  marker.setAttribute('markerWidth', '7')
  marker.setAttribute('markerHeight', '7')
  marker.setAttribute('orient', 'auto-start-reverse')
  const arrow = svgElement('path')
  arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
  marker.append(arrow)
  definitions.append(marker)
  svg.append(definitions)

  const labels = new Map<string, { name: string, type: string }>()
  for (const node of localElements(xml, [
    'startEvent', 'endEvent', 'intermediateCatchEvent', 'intermediateThrowEvent',
    'userTask', 'serviceTask', 'manualTask', 'scriptTask', 'businessRuleTask',
    'receiveTask', 'sendTask', 'task', 'exclusiveGateway', 'parallelGateway',
    'inclusiveGateway', 'eventBasedGateway', 'subProcess', 'callActivity',
  ])) {
    const id = node.getAttribute('id')
    if (id) labels.set(id, { name: node.getAttribute('name') || node.localName, type: node.localName })
  }

  const shapes = localElements(xml, ['BPMNShape']).map((shape, index) => {
    const bounds = [...shape.children].find(child => child.localName === 'Bounds')
    return {
      id: shape.getAttribute('bpmnElement') || `shape-${index}`,
      x: Number(bounds?.getAttribute('x') || (index % 5) * 180),
      y: Number(bounds?.getAttribute('y') || Math.floor(index / 5) * 110),
      width: Number(bounds?.getAttribute('width') || 120),
      height: Number(bounds?.getAttribute('height') || 64),
    }
  })
  const shapeById = new Map(shapes.map(shape => [shape.id, shape]))

  const edges = localElements(xml, ['BPMNEdge'])
  for (const edge of edges) {
    const points = [...edge.children]
      .filter(child => child.localName === 'waypoint')
      .map(point => ({ x: Number(point.getAttribute('x')), y: Number(point.getAttribute('y')) }))
    if (points.length < 2) continue
    const line = svgElement('polyline')
    line.setAttribute('points', points.map(point => `${point.x},${point.y}`).join(' '))
    line.setAttribute('class', 'ufv-diagram-edge')
    line.setAttribute('marker-end', `url(#${marker.id})`)
    svg.append(line)
  }

  if (!edges.length) {
    for (const flow of localElements(xml, ['sequenceFlow'])) {
      const from = shapeById.get(flow.getAttribute('sourceRef') || '')
      const to = shapeById.get(flow.getAttribute('targetRef') || '')
      if (!from || !to) continue
      const line = svgElement('line')
      line.setAttribute('x1', String(from.x + from.width / 2))
      line.setAttribute('y1', String(from.y + from.height / 2))
      line.setAttribute('x2', String(to.x + to.width / 2))
      line.setAttribute('y2', String(to.y + to.height / 2))
      line.setAttribute('class', 'ufv-diagram-edge')
      line.setAttribute('marker-end', `url(#${marker.id})`)
      svg.append(line)
    }
  }

  for (const shape of shapes) {
    const metadata = labels.get(shape.id) || { name: shape.id, type: 'task' }
    const centerX = shape.x + shape.width / 2
    const centerY = shape.y + shape.height / 2
    if (metadata.type.includes('Event')) {
      const circle = svgElement('circle')
      circle.setAttribute('cx', String(centerX))
      circle.setAttribute('cy', String(centerY))
      circle.setAttribute('r', String(Math.min(shape.width, shape.height) / 2))
      circle.setAttribute('class', `ufv-diagram-node ufv-diagram-node--${metadata.type === 'endEvent' ? 'end' : 'event'}`)
      svg.append(circle)
      svgText(svg, metadata.name, centerX, shape.y + shape.height + 20, 120)
    } else if (metadata.type.includes('Gateway')) {
      const diamond = svgElement('polygon')
      diamond.setAttribute('points', `${centerX},${shape.y} ${shape.x + shape.width},${centerY} ${centerX},${shape.y + shape.height} ${shape.x},${centerY}`)
      diamond.setAttribute('class', 'ufv-diagram-node ufv-diagram-node--gateway')
      svg.append(diamond)
      const symbol = metadata.type === 'parallelGateway' ? '+' : '×'
      svgText(svg, symbol, centerX, centerY + 5, 30)
      if (metadata.name !== metadata.type) svgText(svg, metadata.name, centerX, shape.y + shape.height + 20, 130)
    } else {
      const rect = svgElement('rect')
      rect.setAttribute('x', String(shape.x))
      rect.setAttribute('y', String(shape.y))
      rect.setAttribute('width', String(shape.width))
      rect.setAttribute('height', String(shape.height))
      rect.setAttribute('rx', metadata.type === 'subProcess' ? '4' : '10')
      rect.setAttribute('class', `ufv-diagram-node ufv-diagram-node--${metadata.type === 'subProcess' ? 'subprocess' : 'task'}`)
      svg.append(rect)
      svgText(svg, metadata.name, centerX, centerY + 4, shape.width - 12)
    }
  }

  const maxX = Math.max(800, ...shapes.map(shape => shape.x + shape.width + 60))
  const maxY = Math.max(420, ...shapes.map(shape => shape.y + shape.height + 60))
  const minX = Math.min(0, ...shapes.map(shape => shape.x - 40))
  const minY = Math.min(0, ...shapes.map(shape => shape.y - 40))
  svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
  svg.style.minWidth = `${Math.min(1600, Math.max(760, maxX - minX))}px`
  canvas.append(svg)
  content.append(canvas)
  return root
}

interface XMindTopic {
  title?: string
  children?: { attached?: XMindTopic[] }
}

function topicBranch(topic: XMindTopic, depth = 0): HTMLElement {
  const item = element('li', `ufv-mindmap-node ufv-mindmap-node--depth-${Math.min(depth, 3)}`)
  const label = element('span')
  label.textContent = topic.title || (isChinese() ? '未命名主题' : 'Untitled topic')
  item.append(label)
  const children = topic.children?.attached || []
  if (children.length) {
    const list = element('ul')
    children.slice(0, 120).forEach(child => list.append(topicBranch(child, depth + 1)))
    item.append(list)
  }
  return item
}

function renderXMind(files: ZipFiles, file: FileDescriptor, objectUrls: string[]): HTMLElement {
  const contentFile = files['content.json']
  if (!contentFile) throw new Error('XMind content.json is missing')
  const sheets = JSON.parse(strFromU8(contentFile)) as Array<{ title?: string, rootTopic?: XMindTopic }>
  const { root, content } = shell(file, 'mindmap', isChinese() ? 'XMind 思维导图' : 'XMind mind map')
  const workspace = element('div', 'ufv-mindmap-workspace')
  const thumbnail = files['Thumbnails/thumbnail.png']
  if (thumbnail) {
    const preview = document.createElement('img')
    const thumbnailBuffer = thumbnail.slice().buffer as ArrayBuffer
    const url = URL.createObjectURL(new Blob([thumbnailBuffer], { type: 'image/png' }))
    objectUrls.push(url)
    preview.src = url
    preview.alt = `${file.name} thumbnail`
    preview.className = 'ufv-mindmap-thumbnail'
    workspace.append(preview)
  }
  const outline = element('div', 'ufv-mindmap-outline')
  for (const sheet of sheets.slice(0, 8)) {
    const section = element('section')
    const heading = element('h2')
    heading.textContent = sheet.title || (isChinese() ? '画布' : 'Sheet')
    section.append(heading)
    if (sheet.rootTopic) {
      const list = element('ul', 'ufv-mindmap-tree')
      list.append(topicBranch(sheet.rootTopic))
      section.append(list)
    }
    outline.append(section)
  }
  workspace.append(outline)
  content.append(workspace)
  return root
}

function decodeMimeWord(value: string): string {
  return value.replace(/=\?([^?]+)\?([bqBQ])\?([^?]+)\?=/g, (_match, charset, encoding, data) => {
    try {
      const bytes = encoding.toLowerCase() === 'b'
        ? Uint8Array.from(atob(data), character => character.charCodeAt(0))
        : Uint8Array.from(data.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_m: string, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))), (character: string) => character.charCodeAt(0))
      return new TextDecoder(String(charset).toLowerCase()).decode(bytes)
    } catch {
      return data
    }
  })
}

function renderEmail(source: string, file: FileDescriptor): HTMLElement {
  const normalized = source.replace(/\r\n/g, '\n')
  const split = normalized.indexOf('\n\n')
  const rawHeaders = split >= 0 ? normalized.slice(0, split) : normalized
  const rawBody = split >= 0 ? normalized.slice(split + 2) : ''
  const unfolded = rawHeaders.replace(/\n[ \t]+/g, ' ')
  const headers = new Map<string, string>()
  unfolded.split('\n').forEach(line => {
    const separator = line.indexOf(':')
    if (separator > 0) headers.set(line.slice(0, separator).toLowerCase(), decodeMimeWord(line.slice(separator + 1).trim()))
  })
  let body = rawBody
  const transfer = headers.get('content-transfer-encoding')?.toLowerCase()
  if (transfer === 'base64') {
    try { body = new TextDecoder().decode(Uint8Array.from(atob(body.replace(/\s/g, '')), character => character.charCodeAt(0))) } catch { /* keep source */ }
  } else if (transfer === 'quoted-printable') {
    body = body.replace(/=\n/g, '').replace(/=([0-9A-F]{2})/gi, (_match, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
  }
  const { root, content } = shell(file, 'email', isChinese() ? '邮件' : 'Email message')
  const card = element('article', 'ufv-email')
  const subject = element('h1')
  subject.textContent = headers.get('subject') || (isChinese() ? '（无主题）' : '(No subject)')
  const metadata = element('dl')
  const fields = [
    [isChinese() ? '发件人' : 'From', headers.get('from')],
    [isChinese() ? '收件人' : 'To', headers.get('to')],
    [isChinese() ? '日期' : 'Date', headers.get('date')],
  ]
  fields.forEach(([label, value]) => {
    if (!value) return
    const term = element('dt')
    term.textContent = label || ''
    const description = element('dd')
    description.textContent = value
    metadata.append(term, description)
  })
  const message = element('div', 'ufv-email-body')
  const htmlBody = /content-type:\s*text\/html/i.test(rawHeaders)
  message.textContent = htmlBody ? (parseHtml(body).body.textContent || '') : body.trim()
  card.append(subject, metadata, message)
  content.append(card)
  return root
}

function decodeRtf(source: string): string {
  return source
    .replace(/\\u(-?\d+)\??/g, (_match, value) => String.fromCharCode(Number(value) < 0 ? Number(value) + 65536 : Number(value)))
    .replace(/\\'([0-9a-f]{2})/gi, (_match, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\par[d]?\b/g, '\n')
    .replace(/\\tab\b/g, '\t')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\\([{}\\])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function renderRtf(source: string, file: FileDescriptor): HTMLElement {
  const { root, content } = shell(file, 'reader', isChinese() ? 'RTF 富文本' : 'RTF document')
  const page = element('article', 'ufv-reader-page')
  decodeRtf(source).split(/\n{2,}/).filter(Boolean).forEach(value => {
    const paragraph = element('p')
    paragraph.textContent = value
    page.append(paragraph)
  })
  content.append(page)
  return root
}

function safeReaderBlock(node: Element): HTMLElement | undefined {
  const blockNames = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'li'])
  const name = node.localName.toLowerCase()
  if (!blockNames.has(name)) return undefined
  const output = element(name === 'li' ? 'p' : name)
  output.textContent = node.textContent?.trim() || ''
  return output.textContent ? output : undefined
}

function renderEpub(files: ZipFiles, file: FileDescriptor, objectUrls: string[]): HTMLElement {
  const container = xmlPart(files, 'META-INF/container.xml')
  const packagePath = localElements(container, ['rootfile'])[0]?.getAttribute('full-path')
  if (!packagePath) throw new Error('EPUB package path is missing')
  const packageXml = xmlPart(files, packagePath)
  const base = packagePath.includes('/') ? packagePath.slice(0, packagePath.lastIndexOf('/') + 1) : ''
  const manifest = new Map(localElements(packageXml, ['item']).map(item => [
    item.getAttribute('id') || '',
    item.getAttribute('href') || '',
  ]))
  const chapters = localElements(packageXml, ['itemref'])
    .map(item => manifest.get(item.getAttribute('idref') || ''))
    .filter((path): path is string => Boolean(path))
    .map(path => `${base}${path.replace(/^\.\//, '')}`)
    .filter(path => files[path])
    .slice(0, 200)
  const title = localElements(packageXml, ['title'])[0]?.textContent?.trim() || file.name
  const creator = localElements(packageXml, ['creator'])[0]?.textContent?.trim() || ''
  const { root, content } = shell(file, 'reader', isChinese() ? 'EPUB 电子书' : 'EPUB book')
  const reader = element('div', 'ufv-epub')
  const navigation = element('nav', 'ufv-epub-navigation')
  const bookTitle = element('h2')
  bookTitle.textContent = title
  navigation.append(bookTitle)
  if (creator) {
    const author = element('p')
    author.textContent = creator
    navigation.append(author)
  }
  const list = element('div', 'ufv-epub-chapters')
  const stage = element('article', 'ufv-reader-page ufv-epub-page')
  const initialPath = chapters.find(path => {
    const chapter = parseHtml(strFromU8(files[path]!))
    return (chapter.body.textContent?.trim().length || 0) > 120
  }) || chapters[0]
  const renderChapter = (path: string) => {
    stage.replaceChildren()
    const chapter = parseHtml(strFromU8(files[path]!))
    const blocks = [...chapter.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,blockquote,pre,li')]
      .map(safeReaderBlock)
      .filter((node): node is HTMLElement => Boolean(node))
      .slice(0, 1200)
    stage.append(...blocks)
    if (!blocks.length) stage.textContent = chapter.body.textContent?.trim() || ''
  }
  chapters.forEach((path, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = `${index + 1}. ${path.split('/').pop()}`
    button.setAttribute('aria-pressed', String(path === initialPath))
    button.addEventListener('click', () => {
      for (const item of list.querySelectorAll('button')) item.setAttribute('aria-pressed', String(item === button))
      renderChapter(path)
    })
    list.append(button)
  })
  navigation.append(list)
  if (initialPath) renderChapter(initialPath)
  reader.append(navigation, stage)
  content.append(reader)
  void objectUrls
  return root
}

function textContentByLocalName(parent: ParentNode, name: string): string {
  return localElements(parent, [name]).map(node => node.textContent || '').join('').trim()
}

function odfCellText(cell: Element): string {
  return directChildren(cell, 'p').map(paragraph => paragraph.textContent || '').join('\n').trim()
}

function renderOdf(xml: XMLDocument, file: FileDescriptor): HTMLElement {
  const kind = ['ods', 'ots', 'fods'].includes(file.extension)
    ? 'spreadsheet'
    : ['odp', 'otp'].includes(file.extension) ? 'presentation' : 'document'
  const labels = {
    document: isChinese() ? 'OpenDocument 文档' : 'OpenDocument text',
    spreadsheet: isChinese() ? 'OpenDocument 表格' : 'OpenDocument spreadsheet',
    presentation: isChinese() ? 'OpenDocument 演示文稿' : 'OpenDocument presentation',
  }
  const { root, content } = shell(file, kind === 'spreadsheet' ? 'sheet' : 'reader', labels[kind])
  if (kind === 'spreadsheet') {
    const book = element('div', 'ufv-odf-sheets')
    for (const tableNode of localElements(xml, ['table']).slice(0, 20)) {
      const section = element('section', 'ufv-odf-sheet')
      const heading = element('h2')
      heading.textContent = tableNode.getAttributeNS('*', 'name') || tableNode.getAttribute('table:name') || (isChinese() ? '工作表' : 'Sheet')
      const table = document.createElement('table')
      for (const row of directChildren(tableNode, 'table-row').slice(0, 500)) {
        const tr = document.createElement('tr')
        for (const cell of [...row.children].filter(child => ['table-cell', 'covered-table-cell'].includes(child.localName)).slice(0, 100)) {
          const repeat = Math.min(20, Number(cell.getAttributeNS('*', 'number-columns-repeated') || cell.getAttribute('table:number-columns-repeated') || 1))
          for (let index = 0; index < repeat; index += 1) {
            const td = document.createElement('td')
            td.textContent = odfCellText(cell)
            tr.append(td)
          }
        }
        table.append(tr)
      }
      section.append(heading, table)
      book.append(section)
    }
    content.append(book)
    return root
  }
  const reader = element('div', kind === 'presentation' ? 'ufv-odf-slides' : 'ufv-reader-page')
  const scopes = kind === 'presentation' ? localElements(xml, ['page']) : [xml.documentElement]
  scopes.slice(0, 300).forEach((scope, index) => {
    const page = kind === 'presentation' ? element('section', 'ufv-office-slide') : reader
    if (kind === 'presentation') {
      const heading = element('h2')
      heading.textContent = `${isChinese() ? '幻灯片' : 'Slide'} ${index + 1}`
      page.append(heading)
    }
    for (const node of localElements(scope, ['h', 'p']).slice(0, 3000)) {
      const text = node.textContent?.trim()
      if (!text) continue
      const block = element(node.localName === 'h' ? 'h2' : 'p')
      block.textContent = text
      page.append(block)
    }
    if (kind === 'presentation') reader.append(page)
  })
  content.append(reader)
  return root
}

function renderOfd(files: ZipFiles, file: FileDescriptor): HTMLElement {
  const { root, content } = shell(file, 'reader', 'OFD')
  const pages = Object.keys(files)
    .filter(path => /\/Pages\/Page_[^/]+\/Content\.xml$/i.test(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const book = element('div', 'ufv-ofd-pages')
  pages.slice(0, 500).forEach((path, index) => {
    const xml = xmlPart(files, path)
    const page = element('article', 'ufv-reader-page ufv-ofd-page')
    const number = element('span', 'ufv-ofd-page-number')
    number.textContent = `${index + 1} / ${pages.length}`
    page.append(number)
    for (const text of localElements(xml, ['TextCode'])) {
      const value = text.textContent?.trim()
      if (!value) continue
      const span = element('span', 'ufv-ofd-text')
      span.textContent = value
      page.append(span)
    }
    book.append(page)
  })
  content.append(book)
  return root
}

function visioCell(shape: Element, name: string, fallback = 0): number {
  const cell = [...shape.children].find(child => child.localName === 'Cell' && child.getAttribute('N') === name)
  const value = Number(cell?.getAttribute('V'))
  return Number.isFinite(value) ? value : fallback
}

function renderVsdx(files: ZipFiles, file: FileDescriptor): HTMLElement {
  const pagePath = Object.keys(files).find(path => /^visio\/pages\/page\d+\.xml$/i.test(path))
  if (!pagePath) throw new Error('Visio page XML is missing')
  const xml = xmlPart(files, pagePath)
  const pageSheet = localElements(xml, ['PageSheet'])[0]
  const width = pageSheet ? visioCell(pageSheet, 'PageWidth', 11.7) : 11.7
  const height = pageSheet ? visioCell(pageSheet, 'PageHeight', 8.3) : 8.3
  const scale = 96
  const { root, content } = shell(file, 'diagram', isChinese() ? 'Visio 流程图' : 'Visio diagram')
  const canvas = element('div', 'ufv-diagram-canvas')
  const svg = svgElement('svg')
  svg.setAttribute('viewBox', `0 0 ${width * scale} ${height * scale}`)
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', file.name)
  svg.style.minWidth = `${Math.max(760, width * scale)}px`
  const shapes = localElements(xml, ['Shape']).filter(shape => shape.parentElement?.localName === 'Shapes')
  for (const shape of shapes.slice(0, 1000)) {
    const pinX = visioCell(shape, 'PinX', width / 2) * scale
    const pinY = (height - visioCell(shape, 'PinY', height / 2)) * scale
    const shapeWidth = Math.max(8, visioCell(shape, 'Width', 1) * scale)
    const shapeHeight = Math.max(8, visioCell(shape, 'Height', 0.5) * scale)
    const text = directChildren(shape, 'Text').map(node => node.textContent || '').join('').trim()
    const rect = svgElement('rect')
    rect.setAttribute('x', String(pinX - shapeWidth / 2))
    rect.setAttribute('y', String(pinY - shapeHeight / 2))
    rect.setAttribute('width', String(shapeWidth))
    rect.setAttribute('height', String(shapeHeight))
    rect.setAttribute('rx', '6')
    rect.setAttribute('class', text ? 'ufv-diagram-node ufv-diagram-node--task' : 'ufv-visio-geometry')
    svg.append(rect)
    if (text) svgText(svg, text.replace(/\s+/g, ' '), pinX, pinY + 4, shapeWidth - 8)
  }
  canvas.append(svg)
  content.append(canvas)
  return root
}

async function createPreview(
  file: FileDescriptor,
  signal: AbortSignal,
  objectUrls: string[],
): Promise<HTMLElement> {
  const bytes = new Uint8Array(await file.blob.arrayBuffer())
  if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
  const source = () => new TextDecoder().decode(bytes)
  switch (file.extension) {
    case 'bpmn': return renderBpmn(source(), file)
    case 'eml': return renderEmail(source(), file)
    case 'rtf': return renderRtf(source(), file)
    case 'fodt':
    case 'fods': return renderOdf(parseXml(source(), file.name), file)
    case 'xmind': return renderXMind(unzip(bytes), file, objectUrls)
    case 'epub': return renderEpub(unzip(bytes), file, objectUrls)
    case 'ofd': return renderOfd(unzip(bytes), file)
    case 'vsdx': return renderVsdx(unzip(bytes), file)
    case 'odt':
    case 'ods':
    case 'ots':
    case 'odp':
    case 'otp':
    case 'ott': return renderOdf(xmlPart(unzip(bytes), 'content.xml'), file)
    default: throw new Error(`Unsupported structured format: ${file.extension}`)
  }
}

export const structuredAdapter: PreviewAdapter = {
  id: 'structured',
  label: 'Structured document renderer',
  supports: file => {
    if (!extensions.has(file.extension)) return false
    if (odfZipExtensions.has(file.extension)) {
      return file.head[0] === 0x50 && file.head[1] === 0x4b
    }
    return true
  },
  async open(file): Promise<PreviewSession> {
    if (file.size > MAX_INPUT_SIZE) {
      throw new Error(isChinese()
        ? '结构化文件超过 30 MB 浏览器预览限制。'
        : 'Structured document exceeds the 30 MB browser preview limit.')
    }
    let root: HTMLElement | undefined
    const objectUrls: string[] = []
    return {
      adapterId: 'structured',
      adapterLabel: 'Structured document renderer',
      capabilities: ['preview', 'select-text', 'copy'],
      async mount(container, signal) {
        root = await createPreview(file, signal, objectUrls)
        if (signal.aborted) throw new DOMException('Preview was cancelled', 'AbortError')
        container.replaceChildren(root)
      },
      dispose() {
        root?.remove()
        root = undefined
        objectUrls.splice(0).forEach(url => URL.revokeObjectURL(url))
      },
    }
  },
}

export const structuredAdapterManifest = {
  id: 'structured',
  priority: 25,
  extensions: [...extensions],
  mimeTypes: [
    'application/epub+zip', 'message/rfc822', 'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.visio',
  ],
  load: async () => structuredAdapter,
}
