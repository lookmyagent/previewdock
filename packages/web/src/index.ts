import type {
  FileDescriptor,
  FileSource,
  OpenResult,
  ViewerEngine,
  ViewerPhase,
  ViewerStatus,
} from '@previewdock/core'

export type PreviewDockLocale = 'en' | 'zh-CN'

export interface PreviewDockMessages {
  empty: string
  unavailable: string
  unsupported: string
  phases: Record<ViewerPhase, string>
}

export interface PreviewDockHostOptions {
  engine: ViewerEngine
  source?: FileSource | null
  fileName?: string
  mimeType?: string
  showToolbar?: boolean
  emptyTitle?: string
  locale?: PreviewDockLocale
  messages?: Partial<PreviewDockMessages>
  onReady?: (result: OpenResult) => void
  onError?: (error: unknown) => void
  onStatus?: (status: ViewerStatus) => void
}

export interface PreviewDockController {
  open(source: FileSource, options?: { fileName?: string; mimeType?: string }): Promise<void>
  update(options: Partial<Omit<PreviewDockHostOptions, 'engine'>>): void
  dispose(): Promise<void>
}

const messages: Record<PreviewDockLocale, PreviewDockMessages> = {
  en: {
    empty: 'Open a file to preview',
    unavailable: 'Preview unavailable',
    unsupported: 'No preview adapter is available for this format',
    phases: {
      idle: 'Idle',
      'loading-source': 'Loading file',
      detecting: 'Detecting format',
      'loading-adapter': 'Loading renderer',
      opening: 'Opening preview',
      ready: 'Preview ready',
      error: 'Preview failed',
    },
  },
  'zh-CN': {
    empty: '打开文件以开始预览',
    unavailable: '暂不支持在线预览',
    unsupported: '当前没有适用于此格式的预览适配器',
    phases: {
      idle: '空闲',
      'loading-source': '正在读取文件',
      detecting: '正在识别格式',
      'loading-adapter': '正在加载渲染器',
      opening: '正在打开预览',
      ready: '预览已就绪',
      error: '预览失败',
    },
  },
}

const STYLE_ID = 'previewdock-web-host-style'
const hostStyle = `
.pd-host{position:relative;display:flex;height:100%;min-height:0;flex-direction:column;overflow:hidden;background:#fff;color:#172033;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.pd-host__toolbar{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:20px;padding:0 18px;border-bottom:1px solid #e3e8f0;background:#fff}
.pd-host__title{display:flex;min-width:0;align-items:baseline;gap:10px}.pd-host__name{overflow:hidden;color:#111827;font-size:14px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}
.pd-host__meta,.pd-host__status{color:#778196;font-size:12px}.pd-host__surface{position:relative;min-height:0;flex:1;overflow:auto;background:#f7f9fc}.pd-host__mount{height:100%;min-height:100%}
.pd-host__overlay{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;gap:10px;background:#f7f9fc;color:#778196;font-size:13px;text-align:center}
.pd-host__overlay[hidden]{display:none}.pd-host__overlay--error{flex-direction:column;color:#8f2630}.pd-host__spinner{width:16px;height:16px;border:2px solid #cfd7e6;border-top-color:#315ee7;border-radius:50%;animation:pd-host-spin .75s linear infinite}
.ufv-pdf-preview{display:block;width:100%;min-width:0;height:100%;min-height:100%;border:0;background:#e8ebf0}
.ufv-sheet-preview{display:grid;grid-template-rows:46px minmax(0,1fr) 38px;height:100%;min-height:360px;overflow:hidden;background:#fff;color:#263044;font-size:12px}.ufv-sheet-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 16px;border-bottom:1px solid #dfe5ed;background:#fff}.ufv-sheet-toolbar strong{overflow:hidden;color:#172033;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.ufv-sheet-toolbar span{flex:none;padding:3px 8px;border-radius:10px;background:#eef4ff;color:#315ee7;font-size:11px}.ufv-sheet-stage{min-height:0;overflow:auto;background:#f7f9fc}.ufv-sheet-panel{min-width:max-content;min-height:100%;background:#fff}.ufv-sheet-panel[hidden]{display:none}.ufv-sheet-preview table{min-width:100%;border-spacing:0;border-collapse:separate;table-layout:fixed;background:#fff}.ufv-sheet-preview th,.ufv-sheet-preview td{box-sizing:border-box;min-width:112px;height:28px;padding:4px 8px;overflow:hidden;border:0;border-right:1px solid #e2e7ee;border-bottom:1px solid #e2e7ee;background:#fff;font-weight:400;line-height:19px;text-align:left;text-overflow:ellipsis;white-space:nowrap}.ufv-sheet-preview thead th{position:sticky;top:0;z-index:2;height:26px;background:#f2f5f9;color:#657187;font-size:11px;font-weight:600;text-align:center}.ufv-sheet-preview tbody th{position:sticky;left:0;z-index:1;min-width:44px;width:44px;background:#f2f5f9;color:#657187;font-size:11px;text-align:center}.ufv-sheet-preview .ufv-sheet-corner{left:0;z-index:3;min-width:44px;width:44px}.ufv-sheet-preview tbody tr:first-child td{color:#172033;font-weight:600}.ufv-sheet-tabs{display:flex;align-items:stretch;gap:2px;overflow-x:auto;padding:0 10px;border-top:1px solid #dfe5ed;background:#f3f6fa}.ufv-sheet-tab{position:relative;flex:none;min-width:88px;padding:0 14px;border:0;background:transparent;color:#5d687d;cursor:pointer;font:inherit}.ufv-sheet-tab:hover{background:#e9eef6;color:#24314a}.ufv-sheet-tab[aria-selected="true"]{background:#fff;color:#22663d;font-weight:650}.ufv-sheet-tab[aria-selected="true"]::after{position:absolute;right:10px;bottom:0;left:10px;height:2px;background:#28905a;content:""}
.ufv-odf-sheets{padding:24px}.ufv-odf-sheet{width:max-content;min-width:calc(100% - 48px);margin:0 0 24px;padding:20px;border:1px solid #dfe5ee;border-radius:7px;background:#fff}.ufv-odf-sheet h2{margin:0 0 14px;font-size:14px}.ufv-odf-sheet table{border-spacing:0;border-collapse:collapse}.ufv-odf-sheet td{min-width:96px;max-width:280px;padding:7px 10px;border:1px solid #dfe5ee;overflow-wrap:anywhere;font-size:12px;vertical-align:top}
@keyframes pd-host-spin{to{transform:rotate(360deg)}}`

function installStyles(documentRef: Document): void {
  if (documentRef.getElementById(STYLE_ID)) return
  const style = documentRef.createElement('style')
  style.id = STYLE_ID
  style.textContent = hostStyle
  documentRef.head.append(style)
}

function bytesLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function mountPreviewDock(
  container: HTMLElement,
  initialOptions: PreviewDockHostOptions,
): PreviewDockController {
  installStyles(container.ownerDocument)
  let options = { showToolbar: true, locale: 'en' as PreviewDockLocale, ...initialOptions }
  let descriptor: FileDescriptor | undefined
  let requestId = 0
  let disposed = false

  const root = container.ownerDocument.createElement('section')
  root.className = 'ufv pd-host'
  const toolbar = container.ownerDocument.createElement('header')
  toolbar.className = 'ufv__toolbar pd-host__toolbar'
  const title = container.ownerDocument.createElement('div')
  title.className = 'ufv__title pd-host__title'
  const name = container.ownerDocument.createElement('span')
  name.className = 'ufv__name pd-host__name'
  const meta = container.ownerDocument.createElement('span')
  meta.className = 'ufv__meta pd-host__meta'
  const statusLabel = container.ownerDocument.createElement('span')
  statusLabel.className = 'ufv__status pd-host__status'
  title.append(name, meta)
  toolbar.append(title, statusLabel)
  const surface = container.ownerDocument.createElement('div')
  surface.className = 'ufv__host pd-host__surface'
  const mount = container.ownerDocument.createElement('div')
  mount.className = 'ufv__mount pd-host__mount'
  const overlay = container.ownerDocument.createElement('div')
  overlay.className = 'ufv__empty pd-host__overlay'
  surface.append(mount, overlay)
  root.append(toolbar, surface)
  container.replaceChildren(root)

  function resolvedMessages(): PreviewDockMessages {
    const base = messages[options.locale || 'en']
    return {
      ...base,
      ...options.messages,
      phases: { ...base.phases, ...options.messages?.phases },
    }
  }

  function render(status: ViewerStatus = { phase: 'idle', message: 'Idle' }, error?: string): void {
    const copy = resolvedMessages()
    toolbar.hidden = options.showToolbar === false
    name.textContent = options.fileName || descriptor?.name || options.emptyTitle || copy.empty
    meta.textContent = descriptor
      ? `${descriptor.extension.toUpperCase() || descriptor.mimeType} · ${bytesLabel(descriptor.size)}`
      : ''
    statusLabel.textContent = copy.phases[status.phase]
    const busy = ['loading-source', 'detecting', 'loading-adapter', 'opening'].includes(status.phase)
    root.setAttribute('aria-busy', String(busy))
    overlay.className = error
      ? 'ufv__error pd-host__overlay pd-host__overlay--error'
      : busy
        ? 'ufv__loading pd-host__overlay'
        : 'ufv__empty pd-host__overlay'
    overlay.replaceChildren()
    if (error) {
      const strong = container.ownerDocument.createElement('strong')
      strong.textContent = copy.unavailable
      const detail = container.ownerDocument.createElement('span')
      detail.textContent = error.startsWith('No preview adapter') ? copy.unsupported : error
      overlay.append(strong, detail)
      overlay.hidden = false
    } else if (busy) {
      const spinner = container.ownerDocument.createElement('span')
      spinner.className = 'ufv__spinner pd-host__spinner'
      spinner.setAttribute('aria-hidden', 'true')
      overlay.append(spinner, container.ownerDocument.createTextNode(copy.phases[status.phase]))
      overlay.hidden = false
    } else if (!options.source && !descriptor) {
      overlay.textContent = options.emptyTitle || copy.empty
      overlay.hidden = false
    } else {
      overlay.hidden = true
    }
  }

  const stopStatus = options.engine.onStatus(status => {
    render(status)
    options.onStatus?.(status)
  })

  async function open(
    source: FileSource,
    next: { fileName?: string; mimeType?: string } = {},
  ): Promise<void> {
    const current = ++requestId
    options = { ...options, source, fileName: next.fileName ?? options.fileName, mimeType: next.mimeType ?? options.mimeType }
    descriptor = undefined
    try {
      const result = await options.engine.open(source, {
        name: options.fileName || undefined,
        mimeType: options.mimeType || undefined,
      })
      if (disposed || current !== requestId) {
        await result.session.dispose()
        return
      }
      descriptor = result.descriptor
      render({ phase: 'ready', message: 'Preview ready', adapterId: result.session.adapterId })
      await result.session.mount(mount, result.signal)
      options.onReady?.(result)
    } catch (error) {
      if (disposed || current !== requestId || (error instanceof DOMException && error.name === 'AbortError')) return
      render({ phase: 'error', message: String(error) }, error instanceof Error ? error.message : String(error))
      options.onError?.(error)
    }
  }

  function update(next: Partial<Omit<PreviewDockHostOptions, 'engine'>>): void {
    const previousSource = options.source
    const previousName = options.fileName
    const previousMime = options.mimeType
    options = { ...options, ...next }
    render()
    if (options.source !== null && options.source !== undefined
      && (options.source !== previousSource || options.fileName !== previousName || options.mimeType !== previousMime)) {
      void open(options.source)
    } else if (options.source === null) {
      descriptor = undefined
      mount.replaceChildren()
      void options.engine.close()
      render()
    }
  }

  const controller: PreviewDockController = {
    open,
    update,
    async dispose() {
      if (disposed) return
      disposed = true
      requestId += 1
      stopStatus()
      await options.engine.close()
      root.remove()
    },
  }
  render()
  if (options.source !== null && options.source !== undefined) void open(options.source)
  return controller
}

const HTMLElementBase: typeof HTMLElement = typeof HTMLElement === 'undefined'
  ? class {} as typeof HTMLElement
  : HTMLElement

export class PreviewDockElement extends HTMLElementBase {
  private controller?: PreviewDockController
  private _engine?: ViewerEngine
  private _source?: FileSource | null

  static get observedAttributes(): string[] {
    return ['src', 'file-name', 'mime-type', 'locale', 'show-toolbar']
  }

  set engine(value: ViewerEngine | undefined) {
    this._engine = value
    this.remount()
  }
  get engine(): ViewerEngine | undefined { return this._engine }

  set source(value: FileSource | null | undefined) {
    this._source = value
    this.controller?.update({ source: value })
  }
  get source(): FileSource | null | undefined { return this._source }

  connectedCallback(): void { this.remount() }
  disconnectedCallback(): void { void this.controller?.dispose(); this.controller = undefined }
  attributeChangedCallback(): void { this.remount() }

  async open(source: FileSource, options?: { fileName?: string; mimeType?: string }): Promise<void> {
    if (!this.controller) this.remount()
    if (!this.controller) throw new Error('PreviewDockElement requires an engine property')
    await this.controller.open(source, options)
  }

  private remount(): void {
    if (!this.isConnected || !this._engine) return
    void this.controller?.dispose()
    const src = this.getAttribute('src')
    this.controller = mountPreviewDock(this, {
      engine: this._engine,
      source: this._source ?? src,
      fileName: this.getAttribute('file-name') || undefined,
      mimeType: this.getAttribute('mime-type') || undefined,
      locale: this.getAttribute('locale') === 'zh-CN' ? 'zh-CN' : 'en',
      showToolbar: this.getAttribute('show-toolbar') !== 'false',
    })
  }
}

export function registerPreviewDockElement(tagName = 'preview-dock'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, PreviewDockElement)
  }
}
