import { createAllFormatEngine } from '@previewdock/preset-all'
import { ViewerEngine } from '@previewdock/core'

const assetBase = import.meta.env.BASE_URL
let engine: ViewerEngine
let cjkFontPromise: Promise<Array<{ name: string, data: ArrayBuffer }>> | undefined
let zetaConverterPromise: Promise<Awaited<ReturnType<typeof createZetaConverter>>> | undefined

function loadCjkFont() {
  if (!cjkFontPromise) {
    cjkFontPromise = fetch(`${assetBase}fonts/NotoSansCJKsc-Regular.otf`).then(async response => {
      if (!response.ok) throw new Error(`无法加载 Office 字体：${response.status}`)
      return [{ name: 'NotoSansCJKsc-Regular.otf', data: await response.arrayBuffer() }]
    })
  }
  return cjkFontPromise
}

async function createZetaConverter() {
  const [{ createZetaOfficeConverter }, { default: zetaJsUrl }] = await Promise.all([
    import('@previewdock/converter-zetaoffice'),
    import('zetajs/zeta.js?url'),
  ])
  return createZetaOfficeConverter({
    wasmPackage: 'free',
    zetaJsUrl,
    fontFiles: await loadCjkFont(),
  })
}

async function previewArchiveEntry({ file, container, signal }: {
  file: File
  container: HTMLElement
  signal: AbortSignal
}) {
  const nestedEngine = new ViewerEngine(engine.registry)
  const abort = () => { void nestedEngine.close() }
  signal.addEventListener('abort', abort, { once: true })
  try {
    const result = await nestedEngine.open(file, { name: file.name, mimeType: file.type })
    if (signal.aborted) {
      await nestedEngine.close()
      throw new DOMException('Preview was cancelled', 'AbortError')
    }
    await result.session.mount(container, result.signal)
    return async () => {
      signal.removeEventListener('abort', abort)
      await nestedEngine.close()
    }
  } catch (error) {
    signal.removeEventListener('abort', abort)
    await nestedEngine.close()
    throw error
  }
}

// 一次注册全部官方格式；真正的解析器仍在匹配到文件后按需加载。
engine = createAllFormatEngine({
  archive: {
    workerUrl: `${assetBase}libarchive/worker-bundle.js`,
    previewEntry: previewArchiveEntry,
  },
  model: {
    occtWasmUrl: `${assetBase}occt/occt-import-js.wasm`,
    rhinoLibraryPath: `${assetBase}rhino/`,
    ifcWasmPath: `${assetBase}ifc/`,
  },
  legacyOffice: {
    converter: {
      id: 'zetaoffice-wasm',
      async convert(request) {
        zetaConverterPromise ||= createZetaConverter()
        return (await zetaConverterPromise).convert(request)
      },
    },
  },
})

export const previewEngine = engine
