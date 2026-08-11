import { createAllFormatEngine } from '@previewdock/preset-all'
import { mountPreviewDock } from '@previewdock/web'
import '@previewdock/web/style.css'
import './styles.css'

let converterPromise: Promise<Awaited<ReturnType<typeof createLegacyConverter>>> | undefined

async function createLegacyConverter() {
  const [{ createZetaOfficeConverter }, { default: zetaJsUrl }] = await Promise.all([
    import('@previewdock/converter-zetaoffice'),
    import('zetajs/zeta.js?url'),
  ])
  return createZetaOfficeConverter({ wasmPackage: 'free', zetaJsUrl })
}

const engine = createAllFormatEngine({
  assetBaseUrl: `${import.meta.env.BASE_URL}previewdock/`,
  legacyOffice: {
    converter: {
      id: 'zetaoffice-wasm',
      async convert(request) {
        converterPromise ||= createLegacyConverter()
        return (await converterPromise).convert(request)
      },
    },
  },
})
const input = document.querySelector<HTMLInputElement>('#file-input')!
const preview = document.querySelector<HTMLElement>('#preview')!
const name = document.querySelector<HTMLElement>('#file-name')!
const status = document.querySelector<HTMLElement>('#runtime-status')!
let file: File | null = new File(['# PreviewDock Web\n\n官方全格式预设已启用。'], 'welcome.md', { type: 'text/markdown' })

const controller = mountPreviewDock(preview, {
  engine,
  source: file,
  fileName: file.name,
  locale: 'zh-CN',
  emptyTitle: '选择一个文件开始预览',
  onStatus: next => { status.textContent = next.message },
  onError: next => { status.textContent = next instanceof Error ? next.message : String(next); status.classList.add('runtime-status--error') },
})

function open(next: File | undefined) {
  if (!next) return
  file = next
  name.textContent = next.name
  status.classList.remove('runtime-status--error')
  void controller.open(next, { fileName: next.name, mimeType: next.type })
}

document.querySelector('#choose-file')!.addEventListener('click', () => input.click())
document.querySelector('#restore-example')!.addEventListener('click', () => open(new File(['PreviewDock Web 示例'], 'example.txt', { type: 'text/plain' })))
input.addEventListener('change', () => open(input.files?.[0]))
