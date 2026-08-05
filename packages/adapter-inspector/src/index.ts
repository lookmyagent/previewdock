import type {
  FileDescriptor,
  FormatCategoryId,
  PreviewAdapter,
  PreviewSession,
} from '@previewdock/core'
import { getCategoryExtensions, getFormatDefinition } from '@previewdock/core'

const MAX_INSPECT_BYTES = 2 * 1024 * 1024
const MAX_STRINGS = 160

function isChinese(): boolean {
  return document.documentElement.lang.toLowerCase().startsWith('zh')
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function printableStrings(bytes: Uint8Array): string[] {
  const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const seen = new Set<string>()
  const values: string[] = []
  for (const candidate of decoded.match(/[\p{L}\p{N}\p{P}\p{Zs}_./:@-]{4,160}/gu) || []) {
    const value = candidate.replace(/\s+/g, ' ').trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    values.push(value)
    if (values.length >= MAX_STRINGS) break
  }
  return values
}

function hexRows(bytes: Uint8Array): string {
  const rows: string[] = []
  const limit = Math.min(bytes.length, 512)
  for (let offset = 0; offset < limit; offset += 16) {
    const row = bytes.slice(offset, offset + 16)
    const hex = [...row].map(value => value.toString(16).padStart(2, '0')).join(' ')
    const ascii = [...row].map(value => value >= 32 && value < 127 ? String.fromCharCode(value) : '·').join('')
    rows.push(`${offset.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  ${ascii}`)
  }
  return rows.join('\n')
}

function makeElement<K extends keyof HTMLElementTagNameMap>(
  name: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(name)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

async function createStructuralSession(
  file: FileDescriptor,
  category: FormatCategoryId,
  signal: AbortSignal,
): Promise<PreviewSession> {
  const bytes = await file.readRange(0, Math.min(file.size, MAX_INSPECT_BYTES), signal)
  const strings = printableStrings(bytes)
  const definition = getFormatDefinition(file.extension)

  return {
    adapterId: `structural-inspector-${category}`,
    adapterLabel: isChinese() ? '结构预览' : 'Structural preview',
    capabilities: ['preview', 'select-text', 'copy', 'download'],
    mount(container) {
      const root = makeElement('section', 'pd-inspector')
      const header = makeElement('header', 'pd-inspector__header')
      const copy = makeElement('div')
      copy.append(
        makeElement('span', 'pd-inspector__badge', isChinese() ? '结构预览' : 'STRUCTURAL'),
        makeElement('h2', '', file.name),
        makeElement(
          'p',
          '',
          isChinese()
            ? '展示文件中的真实元数据、可读字符串与二进制结构；不等同于桌面编辑软件的完整排版。'
            : 'Shows real metadata, readable strings and binary structure; this is not desktop-editor fidelity.',
        ),
      )
      const meta = makeElement('dl', 'pd-inspector__meta')
      for (const [term, value] of [
        [isChinese() ? '类别' : 'Category', definition?.family || category],
        [isChinese() ? '格式' : 'Format', file.extension.toUpperCase()],
        [isChinese() ? '大小' : 'Size', formatBytes(file.size)],
        [isChinese() ? '读取方式' : 'Access', file.randomAccess],
      ]) {
        meta.append(makeElement('dt', '', term), makeElement('dd', '', value))
      }
      header.append(copy, meta)

      const body = makeElement('div', 'pd-inspector__body')
      const stringsCard = makeElement('article', 'pd-inspector__card')
      stringsCard.append(makeElement('h3', '', isChinese() ? '文件内容' : 'File content'))
      if (strings.length) {
        const list = makeElement('ol', 'pd-inspector__strings')
        strings.forEach(value => list.append(makeElement('li', '', value)))
        stringsCard.append(list)
      } else {
        stringsCard.append(makeElement('p', 'pd-inspector__empty', isChinese() ? '没有检测到可读字符串。' : 'No readable strings detected.'))
      }
      const hexCard = makeElement('article', 'pd-inspector__card')
      hexCard.append(
        makeElement('h3', '', isChinese() ? '文件头与字节结构' : 'Header and byte structure'),
        makeElement('pre', 'pd-inspector__hex', hexRows(bytes)),
      )
      body.append(stringsCard, hexCard)
      const style = makeElement('style')
      style.textContent = `
.pd-inspector{height:100%;overflow:auto;background:#f4f7fb;color:#172033;font:14px/1.55 Inter,system-ui,sans-serif}
.pd-inspector__header{display:flex;justify-content:space-between;gap:24px;padding:26px;border-bottom:1px solid #dbe3ee;background:#fff}
.pd-inspector__header h2{margin:8px 0 4px;font-size:20px}.pd-inspector__header p{max-width:700px;margin:0;color:#64748b}
.pd-inspector__badge{display:inline-flex;padding:3px 8px;border-radius:999px;background:#e8f0ff;color:#2859b8;font-size:11px;font-weight:800}
.pd-inspector__meta{display:grid;grid-template-columns:auto auto;gap:3px 14px;margin:0;white-space:nowrap}
.pd-inspector__meta dt{color:#7b8798}.pd-inspector__meta dd{margin:0;font-weight:700}
.pd-inspector__body{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(420px,1.2fr);gap:18px;padding:20px}
.pd-inspector__card{min-width:0;padding:20px;border:1px solid #dbe3ee;border-radius:14px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.05)}
.pd-inspector__card h3{margin:0 0 14px;font-size:14px}.pd-inspector__strings{max-height:500px;margin:0;padding-left:22px;overflow:auto}
.pd-inspector__strings li{padding:4px 0;border-bottom:1px solid #edf1f6;overflow-wrap:anywhere}.pd-inspector__hex{max-height:520px;margin:0;overflow:auto;color:#334155;font:12px/1.55 ui-monospace,SFMono-Regular,monospace}
.pd-inspector__empty{color:#7b8798}@media(max-width:760px){.pd-inspector__header{flex-direction:column}.pd-inspector__body{grid-template-columns:1fr}.pd-inspector__meta{white-space:normal}}
`
      root.append(style, header, body)
      container.replaceChildren(root)
    },
    dispose() {},
  }
}

export function createInspectorAdapter(category: FormatCategoryId): PreviewAdapter {
  const extensions = new Set(getCategoryExtensions(category))
  return {
    id: `structural-inspector-${category}`,
    label: `Structural inspector (${category})`,
    supports: file => extensions.has(file.extension),
    open: (file, signal) => createStructuralSession(file, category, signal),
  }
}
