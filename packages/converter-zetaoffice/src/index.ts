import type {
  LegacyOfficeConversionRequest,
  LegacyOfficePdfConverter,
} from '@previewdock/adapter-legacy-office'
import {
  ZetaHelperMain,
  type ZetaHelperMainInstance,
} from './zeta-helper'

const DEFAULT_STARTUP_TIMEOUT = 120_000
const DEFAULT_CONVERSION_TIMEOUT = 180_000
const CANVAS_ID = 'qtcanvas'

const threadWrapperSource = String.raw`
(function () {
  function boot() {
    let module;
    try { module = Module; } catch (_) { module = undefined; }
    if (!module || !module.zetajs) {
      setTimeout(boot, 0);
      return;
    }
    module.zetajs.then(function (zetajs) {
      const port = zetajs.mainPort;
      port.onmessage = function (event) {
        if (event.data.cmd !== 'ZetaHelper::run_thr_script') {
          throw new Error('Unknown ZetaOffice thread command: ' + event.data.cmd);
        }
        port.onmessage = null;
        globalThis.zetajsStore = { zetajs: zetajs, zJsModule: module };
        const threadJs = event.data.threadJs;
        if (threadJs) importScripts(threadJs);
        else port.postMessage({ cmd: 'ready' });
      };
      port.postMessage({ cmd: 'ZetaHelper::thr_started' });
    });
  }
  boot();
})();
`

const officeThreadSource = String.raw`
(function () {
  const store = globalThis.zetajsStore;
  const zetajs = store.zetajs;
  const css = zetajs.uno.com.sun.star;
  const context = zetajs.getUnoComponentContext();
  const desktop = css.frame.Desktop.create(context);
  const port = zetajs.mainPort;
  let model;

  function property(name, value) {
    return new css.beans.PropertyValue({ Name: name, Value: value });
  }

  function closeModel() {
    if (!model) return;
    try {
      const closeable = model.queryInterface(zetajs.type.interface(css.util.XCloseable));
      if (closeable) closeable.close(false);
    } catch (_) {}
    model = undefined;
  }

  function forceCjkTextFont(text) {
    const cursor = text.createTextCursor();
    cursor.gotoStart(false);
    cursor.gotoEnd(true);
    for (const propertyName of [
      'CharFontName',
      'CharFontNameAsian',
      'CharFontNameComplex',
    ]) {
      try { cursor.setPropertyValue(propertyName, 'Noto Sans CJK SC'); } catch (_) {}
    }
  }

  function forceCjkFont(documentModel) {
    // Some old WPS/DOC files keep a Windows-only Asian font reference. The
    // text layer remains Unicode (copy/paste proves that), but PDF export can
    // still emit tofu glyphs when that font is unavailable in WASM. Apply the
    // embedded CJK font to the complete Writer text range while retaining
    // size, weight, color, paragraph and layout properties.
    try {
      forceCjkTextFont(documentModel.getText());
      // Legacy WPS documents frequently put headings and annotations in
      // Writer text frames rather than in the main text stream.
      const frames = documentModel.getTextFrames();
      for (const name of frames.getElementNames()) {
        try { forceCjkTextFont(frames.getByName(name).getText()); } catch (_) {}
      }
    } catch (_) {}
  }

  port.onmessage = function (event) {
    const data = event.data;
    if (data.cmd !== 'convert') {
      port.postMessage({
        cmd: 'conversion-error',
        jobId: data.jobId,
        message: 'Unknown ZetaOffice worker command: ' + data.cmd,
      });
      return;
    }

    try {
      closeModel();
      const loadProperties = [
        property('Hidden', true),
        property('ReadOnly', true),
        property('MacroExecutionMode', 0),
        property('UpdateDocMode', 0),
        property('PickListEntry', false),
      ];
      model = desktop.loadComponentFromURL(
        'file://' + data.from,
        '_blank',
        0,
        loadProperties,
      );
      if (!model) throw new Error('LibreOffice could not open this document');

      if (data.kind === 'document') forceCjkFont(model);

      const filterName = data.target === 'docx'
        ? 'Office Open XML Text'
        : (data.kind === 'presentation'
          ? 'impress_pdf_Export'
          : (data.kind === 'drawing' ? 'draw_pdf_Export' : 'writer_pdf_Export'));
      model.storeToURL('file://' + data.to, [
        property('Overwrite', true),
        property('FilterName', filterName),
      ]);
      closeModel();
      port.postMessage({ cmd: 'converted', jobId: data.jobId });
    } catch (error) {
      let message = error && error.message ? error.message : String(error);
      try {
        const unoError = zetajs.catchUnoException(error);
        message = unoError && unoError.Message ? unoError.Message : message;
      } catch (_) {}
      closeModel();
      port.postMessage({ cmd: 'conversion-error', jobId: data.jobId, message });
    }
  };

  port.postMessage({ cmd: 'ready' });
})();
`

export interface ZetaOfficeConverterOptions {
  /**
   * `free` uses the public ZetaOffice beta CDN. An HTTP(S) URL points to a
   * self-hosted directory containing soffice.js, soffice.wasm and soffice.data.
   */
  wasmPackage?: 'free' | 'business' | string
  /** URL to the zeta.js wrapper emitted by the host bundler, loaded lazily. */
  zetaJsUrl?: string
  /**
   * Optional fonts to install into the in-browser LibreOffice filesystem.
   * CJK fonts are required for DOC/PPT files whose original font is not in
   * the WASM data package. Paths should be relative to /usr/share/fonts.
   */
  fontFiles?: Array<{ name: string; data: ArrayBuffer | Uint8Array }>
  startupTimeoutMs?: number
  conversionTimeoutMs?: number
}

interface RuntimeMessage {
  cmd: 'ready' | 'converted' | 'conversion-error'
  jobId?: number
  message?: string
}

interface PendingConversion {
  resolve: () => void
  reject: (error: Error) => void
  timeout: ReturnType<typeof setTimeout>
}

function timeoutError(message: string): Error {
  const error = new Error(message)
  error.name = 'TimeoutError'
  return error
}

function abortError(): DOMException {
  return new DOMException('Preview was cancelled', 'AbortError')
}

function isChinese(): boolean {
  return document.documentElement.lang.toLowerCase().startsWith('zh')
}

function progressMessage(stage: 'prepare' | 'runtime' | 'starting' | 'open' | 'convert' | 'result'): string {
  const messages = {
    en: {
      prepare: 'Preparing the local document…',
      runtime: 'Loading the browser Office engine (about 50 MB on first use)…',
      starting: 'Starting the browser Office engine…',
      open: 'Opening the document locally…',
      convert: 'Converting to PDF in the browser…',
      result: 'Preparing the document preview…',
    },
    zh: {
      prepare: '正在准备本地文档…',
      runtime: '正在加载浏览器 Office 引擎（首次约 50 MB）…',
      starting: '正在启动浏览器 Office 引擎…',
      open: '正在本地打开文档…',
      convert: '正在浏览器内转换为 PDF…',
      result: '正在准备文档预览…',
    },
  }
  return messages[isChinese() ? 'zh' : 'en'][stage]
}

function raceWithAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError())
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(abortError())
    signal.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', abort)
    })
  })
}

function normalizeWasmPackage(value: string | undefined): string {
  if (!value || value === 'free' || value === 'business') return value || 'free'
  if (value.startsWith('url:')) return value.endsWith('/') ? value : `${value}/`
  const url = new URL(value, window.location.href).toString()
  return `url:${url.endsWith('/') ? url : `${url}/`}`
}

function ensureCanvas(): HTMLCanvasElement {
  const existing = document.getElementById(CANVAS_ID)
  if (existing instanceof HTMLCanvasElement) return existing
  if (existing) {
    throw new Error(`ZetaOffice requires #${CANVAS_ID} to be a canvas element`)
  }
  const canvas = document.createElement('canvas')
  canvas.id = CANVAS_ID
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = [
    'position:fixed',
    'width:1px',
    'height:1px',
    'left:-10000px',
    'top:-10000px',
    'visibility:hidden',
    'pointer-events:none',
  ].join(';')
  document.body.append(canvas)
  return canvas
}

function assertBrowserSupport(): void {
  if (!globalThis.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
    throw new Error(
      'DOC/PPT browser conversion requires Cross-Origin-Opener-Policy: same-origin '
      + 'and Cross-Origin-Embedder-Policy: require-corp response headers.',
    )
  }
  if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') {
    throw new Error('This browser does not support the WebAssembly Worker runtime required by ZetaOffice.')
  }
}

class ZetaOfficeRuntime {
  private readonly options: Required<ZetaOfficeConverterOptions>
  private helper?: ZetaHelperMainInstance
  private workerUrl?: string
  private readyPromise?: Promise<void>
  private queue: Promise<void> = Promise.resolve()
  private nextJobId = 1
  private readonly pending = new Map<number, PendingConversion>()

  constructor(options: ZetaOfficeConverterOptions) {
    this.options = {
      wasmPackage: normalizeWasmPackage(options.wasmPackage),
      zetaJsUrl: options.zetaJsUrl || '',
      fontFiles: options.fontFiles || [],
      startupTimeoutMs: options.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT,
      conversionTimeoutMs: options.conversionTimeoutMs ?? DEFAULT_CONVERSION_TIMEOUT,
    }
  }

  private installFonts(fs: ZetaHelperMainInstance['FS']): void {
    if (!this.options.fontFiles.length) return
    // ZetaOffice ships two font roots. The packaged build's SAL_FONTPATH
    // points at the program resource directory, while fontconfig also scans
    // the shared directory. Populate both so old Word/WPS font names can use
    // the CJK fallback regardless of the runtime build.
    const roots = [
      '/instdir/program/resource/common/fonts',
      '/instdir/share/fonts/truetype',
    ]
    for (const root of roots) {
      try { fs.mkdir(root) } catch { /* exists */ }
    }
    for (const font of this.options.fontFiles) {
      const safeName = font.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const bytes = font.data instanceof Uint8Array ? font.data : new Uint8Array(font.data)
      for (const root of roots) fs.writeFile(`${root}/${safeName}`, bytes)
    }

    // A large number of legacy DOC/WPS files refer to Windows-only Chinese
    // families. Tell the bundled fontconfig to prefer the embedded CJK font
    // for those families instead of falling back to a tofu glyph.
    const aliases = [
      'SimSun', 'NSimSun', '宋体', '宋体-方正超大字符集',
      'SimHei', '黑体', 'Microsoft YaHei', '微软雅黑',
      'KaiTi', '楷体', 'FangSong', '仿宋',
    ]
    const aliasXml = [
      '<?xml version="1.0"?>',
      '<fontconfig>',
      ...aliases.map(family => [
        '  <alias>',
        `    <family>${family}</family>`,
        '    <prefer><family>Noto Sans CJK SC</family></prefer>',
        '  </alias>',
      ].join('\n')),
      '</fontconfig>',
    ].join('\n')
    fs.writeFile(
      '/instdir/share/fontconfig/conf.d/99-ufv-cjk.conf',
      new TextEncoder().encode(aliasXml),
    )
  }

  convert(request: LegacyOfficeConversionRequest): Promise<Blob> {
    const task = this.queue.then(() => this.performConversion(request))
    this.queue = task.then(() => undefined, () => undefined)
    return raceWithAbort(task, request.signal)
  }

  private ensureReady(onProgress: LegacyOfficeConversionRequest['onProgress']): Promise<void> {
    if (this.readyPromise) return this.readyPromise
    this.readyPromise = new Promise<void>((resolve, reject) => {
      try {
        assertBrowserSupport()
        ensureCanvas()
        onProgress(3, progressMessage('runtime'))
        this.workerUrl = URL.createObjectURL(new Blob([officeThreadSource], {
          type: 'text/javascript',
        }))
        const helper = new ZetaHelperMain(this.workerUrl, {
          threadJsType: 'classic',
          wasmPkg: this.options.wasmPackage,
          blockPageScroll: false,
        })
        if (!this.options.zetaJsUrl) {
          throw new Error(
            'ZetaOffice requires the zeta.js wrapper URL. Import zetajs/zeta.js?url '
            + 'from the host bundler and pass it as zetaJsUrl.',
          )
        }
        helper.Module.uno_scripts = [
          this.options.zetaJsUrl,
          URL.createObjectURL(new Blob([threadWrapperSource], { type: 'text/javascript' })),
        ]
        // Emscripten runs preRun after the packaged data files are mounted but
        // before LibreOffice starts its font manager. Install the CJK font at
        // that point as well as after helper.start(), so the newly added font
        // is visible during the very first document load.
        helper.Module.preRun = [() => {
          try {
            const fs = (globalThis as typeof globalThis & { FS?: ZetaHelperMainInstance['FS'] }).FS
            if (fs) this.installFonts(fs)
          } catch (_) {
            // The post-start installation remains as a fallback for builds
            // that do not expose FS during preRun.
          }
        }]
        this.helper = helper
        const timeout = setTimeout(() => {
          reject(timeoutError(
            'ZetaOffice did not start in time. Check the WASM asset URL, network access and COOP/COEP headers.',
          ))
        }, this.options.startupTimeoutMs)

        helper.start(() => {
          // ZetaHelper assigns FS only after the packaged LibreOffice data has
          // been mounted. The worker message posted immediately before this
          // callback is handled on a later task, so fonts are present before
          // the conversion thread opens its first document.
          try {
            this.installFonts(helper.FS)
          } catch (error) {
            clearTimeout(timeout)
            reject(error instanceof Error ? error : new Error(String(error)))
            return
          }
          onProgress(60, progressMessage('starting'))
          helper.thrPort.onmessage = (event: MessageEvent<RuntimeMessage>) => {
            const message = event.data
            if (message.cmd === 'ready') {
              clearTimeout(timeout)
              onProgress(70, progressMessage('starting'))
              resolve()
              return
            }
            if (message.jobId === undefined) return
            const pending = this.pending.get(message.jobId)
            if (!pending) return
            clearTimeout(pending.timeout)
            this.pending.delete(message.jobId)
            if (message.cmd === 'converted') {
              pending.resolve()
            } else {
              pending.reject(new Error(message.message || 'ZetaOffice could not convert this document'))
            }
          }
        })
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
    return this.readyPromise
  }

  private async performConversion(request: LegacyOfficeConversionRequest): Promise<Blob> {
    if (request.signal.aborted) throw abortError()
    request.onProgress(1, progressMessage('prepare'))
    await this.ensureReady(request.onProgress)
    if (request.signal.aborted) throw abortError()

    const helper = this.helper
    if (!helper) throw new Error('ZetaOffice runtime is unavailable')
    const jobId = this.nextJobId
    this.nextJobId += 1
    const inputPath = `/tmp/ufv-input-${jobId}.${request.extension}`
    const outputExtension = request.target === 'docx' ? 'docx' : 'pdf'
    const outputPath = `/tmp/ufv-output-${jobId}.${outputExtension}`
    const input = new Uint8Array(await request.blob.arrayBuffer())
    if (request.signal.aborted) throw abortError()

    request.onProgress(75, progressMessage('open'))
    helper.FS.writeFile(inputPath, input)
    try {
      const converted = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pending.delete(jobId)
          reject(timeoutError('ZetaOffice document conversion timed out.'))
        }, this.options.conversionTimeoutMs)
        this.pending.set(jobId, { resolve, reject, timeout })
      })
      helper.thrPort.postMessage({
        cmd: 'convert',
        jobId,
        from: inputPath,
        to: outputPath,
        extension: request.extension,
        kind: request.kind,
        target: request.target,
      })
      request.onProgress(82, progressMessage('convert'))
      await converted
      if (request.signal.aborted) throw abortError()
      request.onProgress(96, progressMessage('result'))
      const outputBytes = helper.FS.readFile(outputPath).slice()
      request.onProgress(100)
      return new Blob([outputBytes.buffer], {
        type: request.target === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf',
      })
    } finally {
      try { helper.FS.unlink(inputPath) } catch { /* already removed */ }
      try { helper.FS.unlink(outputPath) } catch { /* conversion failed */ }
    }
  }
}

let sharedRuntime: ZetaOfficeRuntime | undefined

export function createZetaOfficeConverter(
  options: ZetaOfficeConverterOptions = {},
): LegacyOfficePdfConverter {
  const runtime = sharedRuntime || (sharedRuntime = new ZetaOfficeRuntime(options))
  return {
    id: 'zetaoffice-wasm',
    convert: request => runtime.convert(request),
  }
}

export const zetaOfficeConverter: LegacyOfficePdfConverter = {
  id: 'zetaoffice-wasm',
  convert(request) {
    return createZetaOfficeConverter().convert(request)
  },
}
